create schema if not exists "private";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.accept_join_request(userid uuid, companyid uuid)
 RETURNS join_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deleted_request public.join_requests%ROWTYPE;
BEGIN
    -- Set user company_id to the correct company_id
    UPDATE public.users
    SET company_id = companyId
    WHERE id = userId;

    -- Delete the join request and return the deleted row
    deleted_request := (SELECT * FROM private.delete_join_request(userId));
    
    RETURN deleted_request;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.delete_join_request(input_user_id uuid)
 RETURNS join_requests
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deleted_request public.join_requests; -- Variable to hold the deleted row
BEGIN
    -- Select the join request to be deleted
    SELECT * INTO deleted_request
    FROM public.join_requests
    WHERE user_id = input_user_id; -- Use the renamed variable here

    -- Ensure the join request exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No join request found for user_id %', input_user_id;
    END IF;

    -- Delete the join request for the specified user_id
    DELETE FROM public.join_requests
    WHERE user_id = input_user_id;

    -- Log the deletion
    RAISE LOG 'Join request for user_id % has been deleted', input_user_id;

    -- Return the deleted join request
    RETURN deleted_request;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.handle_user_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  -- Constants
  ADMIN_STATUS CONSTANT TEXT := 'ADMIN';
  TECHNICIAN_STATUS CONSTANT TEXT := 'TECHNICIAN';
  -- Variables
  new_company_id UUID;  -- ID of the newly created company
  existing_company_id UUID; -- ID of the fetched existing company
  user_meta_data JSONB; -- To extract user meta data
  user_full_name TEXT; -- to extract full name coming from client
  user_phone TEXT; -- To extract phone number coming from client
  input_company_uid TEXT; -- To extract Company UID coming from client
  company_name TEXT; -- To extract Company Name coming from client
  user_status TEXT; -- To extract 'status' from user metadata
  join_request public.join_requests; -- Variable to hold the join request returned
BEGIN
  -- Extract user metadata status
  SELECT raw_user_meta_data
  INTO user_meta_data
  FROM auth.users
  WHERE id = NEW.id;
  
  IF user_meta_data IS NULL THEN
    RAISE EXCEPTION 'user_meta_data is null!';
  END IF;
  
  user_full_name := user_meta_data->>'fullName';
  user_phone := user_meta_data->>'phoneNumber';
  input_company_uid := user_meta_data->>'companyUID';
  company_name := user_meta_data->>'companyName';
  user_status := user_meta_data->>'status';
  
  RAISE LOG 'user_full_name: %', user_full_name;
  RAISE LOG 'user_phone: %', user_phone;
  RAISE LOG 'company_uid: %', input_company_uid;
  RAISE LOG 'company_name: %', company_name;
  RAISE LOG 'user_status: %', user_status;
  
  -- Case 1: If the user is an admin
  IF user_status = ADMIN_STATUS THEN
    RAISE LOG 'Registering a Company Admin';
    -- Step 1: Insert the User (without the company_id for now)
    INSERT INTO public.users (id, full_name, status)
    VALUES (NEW.id, user_full_name, user_status);
    -- Step 2: Insert the Company, with the user ID as the admin_id
    INSERT INTO public.companies (company_name, company_uid, admin_id)
    VALUES (company_name, input_company_uid, NEW.id)
    RETURNING id INTO new_company_id;
    -- Step 3: Update the User to set the company_id (linking the user to the company)
    UPDATE public.users
    SET company_id = new_company_id
    WHERE id = NEW.id;
  ELSE
    RAISE LOG 'Registering a Technician';
    -- Case 2: If the user is a technician
    -- Fetch the ID of the existing company (customize as needed)
    SELECT id
    INTO existing_company_id
    FROM public.companies
    WHERE company_uid = input_company_uid; -- Replace with actual logic for selecting the company
    -- Ensure the company exists

    IF existing_company_id IS NULL THEN
      RAISE EXCEPTION 'psql: The entered company id does not exist!';
    END IF;

    -- Insert the user with the existing company's ID
    INSERT INTO public.users (id, full_name)
    VALUES (NEW.id, user_full_name);

    -- Call the submit_join_request function instead
    join_request := public.submit_join_request(input_company_uid, NEW.id, user_full_name);
    
    -- Optionally, you can log the created join request
    RAISE LOG 'Join request created: %', join_request;
  END IF;
  
  -- Prevent modifying the auth.users table row
  RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION private.insert_company_uid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- Insert the new company_uid into the company_uids table
  INSERT INTO public.company_uids (company_uid)
  VALUES (NEW.company_uid);
  
  RETURN NEW; -- Return the new row
END;$function$
;

CREATE OR REPLACE FUNCTION private.is_company_admin(target_company_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  is_admin BOOLEAN;
BEGIN
  RAISE NOTICE '[DEBUG] Auth UID: %', auth.uid();
  RAISE NOTICE '[DEBUG] Target Company ID: %', target_company_id;

  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND status = 'ADMIN'
      AND company_id = target_company_id
  ) INTO is_admin;

  RAISE NOTICE '[DEBUG] is_admin result: %', is_admin;

  RETURN is_admin;
END;$function$
;


create extension if not exists "pgtap" with schema "public" version '1.2.0';

create table "public"."addresses" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "address_title" text,
    "address_street" text not null,
    "address_street_2" text,
    "address_city" text,
    "address_state" text,
    "address_zip_code" text,
    "client_id" bigint not null,
    "address_string" text
);


alter table "public"."addresses" enable row level security;

create table "public"."clients" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "client_name" text not null,
    "client_company_name" text,
    "client_phone_number" text,
    "company_id" uuid
);


alter table "public"."clients" enable row level security;

create table "public"."companies" (
    "created_at" timestamp with time zone not null default now(),
    "company_name" text not null,
    "admin_id" uuid not null,
    "id" uuid not null default gen_random_uuid(),
    "company_uid" text not null,
    "config" jsonb
);


alter table "public"."companies" enable row level security;

create table "public"."company_uids" (
    "company_uid" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."company_uids" enable row level security;

create table "public"."forms" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "system_type_id" bigint not null,
    "schema" jsonb default '{"sections": [{"id": 0, "title": "Default Info", "fields": [{"id": 0, "type": "info_section", "title": "Dummy, but necessary", "required": true}]}]}'::jsonb
);


alter table "public"."forms" enable row level security;

create table "public"."job_reports" (
    "created_at" timestamp with time zone not null default now(),
    "system_id" bigint not null,
    "job_report" jsonb not null,
    "client_id" bigint not null,
    "updated_at" timestamp with time zone not null default now(),
    "id" uuid not null default gen_random_uuid(),
    "job_date" timestamp with time zone
);


alter table "public"."job_reports" enable row level security;

create table "public"."join_requests" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "company_uid" text not null,
    "user_id" uuid not null,
    "user_name" text
);


alter table "public"."join_requests" enable row level security;

create table "public"."system_types" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "system_type" text not null,
    "company_id" uuid not null,
    "visible" boolean not null default true
);


alter table "public"."system_types" enable row level security;

create table "public"."systems" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "system_name" text not null,
    "address_id" bigint not null,
    "area" text,
    "tonnage" real,
    "last_service" timestamp with time zone,
    "system_type_id" bigint
);


alter table "public"."systems" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "full_name" text default ''::text,
    "status" text,
    "company_id" uuid,
    "phone_number" text
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

CREATE UNIQUE INDEX companies_company_uid_key ON public.companies USING btree (company_uid);

CREATE UNIQUE INDEX companies_id_key ON public.companies USING btree (id);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX company_uids_company_uid_key ON public.company_uids USING btree (company_uid);

CREATE UNIQUE INDEX company_uids_pkey ON public.company_uids USING btree (company_uid);

CREATE UNIQUE INDEX forms_pkey ON public.forms USING btree (id);

CREATE UNIQUE INDEX job_reports_pkey ON public.job_reports USING btree (id);

CREATE UNIQUE INDEX join_requests_pkey ON public.join_requests USING btree (id);

CREATE UNIQUE INDEX system_types_pkey ON public.system_types USING btree (id);

CREATE UNIQUE INDEX systems_pkey ON public.systems USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."company_uids" add constraint "company_uids_pkey" PRIMARY KEY using index "company_uids_pkey";

alter table "public"."forms" add constraint "forms_pkey" PRIMARY KEY using index "forms_pkey";

alter table "public"."job_reports" add constraint "job_reports_pkey" PRIMARY KEY using index "job_reports_pkey";

alter table "public"."join_requests" add constraint "join_requests_pkey" PRIMARY KEY using index "join_requests_pkey";

alter table "public"."system_types" add constraint "system_types_pkey" PRIMARY KEY using index "system_types_pkey";

alter table "public"."systems" add constraint "systems_pkey" PRIMARY KEY using index "systems_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."addresses" add constraint "addresses_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE not valid;

alter table "public"."addresses" validate constraint "addresses_client_id_fkey";

alter table "public"."clients" add constraint "clients_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_company_id_fkey";

alter table "public"."companies" add constraint "companies_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."companies" validate constraint "companies_admin_id_fkey";

alter table "public"."companies" add constraint "companies_company_uid_key" UNIQUE using index "companies_company_uid_key";

alter table "public"."companies" add constraint "companies_id_key" UNIQUE using index "companies_id_key";

alter table "public"."company_uids" add constraint "company_uids_company_uid_fkey" FOREIGN KEY (company_uid) REFERENCES companies(company_uid) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."company_uids" validate constraint "company_uids_company_uid_fkey";

alter table "public"."company_uids" add constraint "company_uids_company_uid_key" UNIQUE using index "company_uids_company_uid_key";

alter table "public"."forms" add constraint "forms_system_type_id_fkey" FOREIGN KEY (system_type_id) REFERENCES system_types(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."forms" validate constraint "forms_system_type_id_fkey";

alter table "public"."job_reports" add constraint "service_jobs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE not valid;

alter table "public"."job_reports" validate constraint "service_jobs_client_id_fkey";

alter table "public"."job_reports" add constraint "service_jobs_system_id_fkey" FOREIGN KEY (system_id) REFERENCES systems(id) not valid;

alter table "public"."job_reports" validate constraint "service_jobs_system_id_fkey";

alter table "public"."join_requests" add constraint "join_requests_company_uid_fkey" FOREIGN KEY (company_uid) REFERENCES companies(company_uid) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."join_requests" validate constraint "join_requests_company_uid_fkey";

alter table "public"."join_requests" add constraint "join_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."join_requests" validate constraint "join_requests_user_id_fkey";

alter table "public"."system_types" add constraint "system_types_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."system_types" validate constraint "system_types_company_id_fkey";

alter table "public"."systems" add constraint "systems_address_id_fkey" FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE not valid;

alter table "public"."systems" validate constraint "systems_address_id_fkey";

alter table "public"."systems" add constraint "systems_system_type_id_fkey" FOREIGN KEY (system_type_id) REFERENCES system_types(id) not valid;

alter table "public"."systems" validate constraint "systems_system_type_id_fkey";

alter table "public"."users" add constraint "users_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_company_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

create type "public"."_time_trial_type" as ("a_time" numeric);

CREATE OR REPLACE FUNCTION public.format_address()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.address_string := CONCAT_WS(', ',
    NEW.address_street,
    NEW.address_street_2,
    NEW.address_city,
    NEW.address_state,
    NEW.address_zip_code
  );
  RAISE NOTICE 'Formatted address: %', NEW.address_string;  -- Log the formatted address
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_company_uid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert the new company_uid into the company_uids table
  INSERT INTO public.company_uids (company_uid)
  VALUES (NEW.company_uid);
  
  RETURN NEW; -- Return the new row
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_form_after_system_type()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.forms (system_type_id)
    VALUES (NEW.id); -- Link the new form to the system_type_id
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_join_request(companyid uuid, userid uuid, username text)
 RETURNS join_requests
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    new_request public.join_requests;
BEGIN
    -- Insert the join request
    INSERT INTO public.join_requests (company_id, user_id, user_name, status)
    VALUES (companyId, userId, userName, NULL)
    RETURNING * INTO new_request;

    RETURN new_request;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_join_request(p_company_uid text, p_user_id uuid, p_user_name text)
 RETURNS join_requests
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_request public.join_requests; -- Variable to hold the new row
  exists_uid BOOLEAN;
  exists_request BOOLEAN;
BEGIN
  -- Check if company_uid exists in company_uids table
  SELECT EXISTS (
    SELECT 1 FROM public.company_uids WHERE company_uid = p_company_uid
  ) INTO exists_uid;

  IF NOT exists_uid THEN
    RAISE EXCEPTION 'Company UID % does not exist, cannot submit join request', p_company_uid;
  END IF;

  -- Check if a join request already exists for the user
  SELECT EXISTS (
    SELECT 1 FROM public.join_requests WHERE user_id = p_user_id
  ) INTO exists_request;

  IF exists_request THEN
    RAISE EXCEPTION 'Join request already exists for user_id: %', p_user_id;
  END IF;

  -- Insert the join request
  INSERT INTO public.join_requests (company_uid, user_id, user_name)
  VALUES (p_company_uid, p_user_id, p_user_name)
  RETURNING * INTO new_request;

  RETURN new_request; -- Return the newly created join request
END;
$function$
;

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."company_uids" to "anon";

grant insert on table "public"."company_uids" to "anon";

grant references on table "public"."company_uids" to "anon";

grant select on table "public"."company_uids" to "anon";

grant trigger on table "public"."company_uids" to "anon";

grant truncate on table "public"."company_uids" to "anon";

grant update on table "public"."company_uids" to "anon";

grant delete on table "public"."company_uids" to "authenticated";

grant insert on table "public"."company_uids" to "authenticated";

grant references on table "public"."company_uids" to "authenticated";

grant select on table "public"."company_uids" to "authenticated";

grant trigger on table "public"."company_uids" to "authenticated";

grant truncate on table "public"."company_uids" to "authenticated";

grant update on table "public"."company_uids" to "authenticated";

grant delete on table "public"."company_uids" to "service_role";

grant insert on table "public"."company_uids" to "service_role";

grant references on table "public"."company_uids" to "service_role";

grant select on table "public"."company_uids" to "service_role";

grant trigger on table "public"."company_uids" to "service_role";

grant truncate on table "public"."company_uids" to "service_role";

grant update on table "public"."company_uids" to "service_role";

grant delete on table "public"."forms" to "anon";

grant insert on table "public"."forms" to "anon";

grant references on table "public"."forms" to "anon";

grant select on table "public"."forms" to "anon";

grant trigger on table "public"."forms" to "anon";

grant truncate on table "public"."forms" to "anon";

grant update on table "public"."forms" to "anon";

grant delete on table "public"."forms" to "authenticated";

grant insert on table "public"."forms" to "authenticated";

grant references on table "public"."forms" to "authenticated";

grant select on table "public"."forms" to "authenticated";

grant trigger on table "public"."forms" to "authenticated";

grant truncate on table "public"."forms" to "authenticated";

grant update on table "public"."forms" to "authenticated";

grant delete on table "public"."forms" to "service_role";

grant insert on table "public"."forms" to "service_role";

grant references on table "public"."forms" to "service_role";

grant select on table "public"."forms" to "service_role";

grant trigger on table "public"."forms" to "service_role";

grant truncate on table "public"."forms" to "service_role";

grant update on table "public"."forms" to "service_role";

grant delete on table "public"."job_reports" to "anon";

grant insert on table "public"."job_reports" to "anon";

grant references on table "public"."job_reports" to "anon";

grant select on table "public"."job_reports" to "anon";

grant trigger on table "public"."job_reports" to "anon";

grant truncate on table "public"."job_reports" to "anon";

grant update on table "public"."job_reports" to "anon";

grant delete on table "public"."job_reports" to "authenticated";

grant insert on table "public"."job_reports" to "authenticated";

grant references on table "public"."job_reports" to "authenticated";

grant select on table "public"."job_reports" to "authenticated";

grant trigger on table "public"."job_reports" to "authenticated";

grant truncate on table "public"."job_reports" to "authenticated";

grant update on table "public"."job_reports" to "authenticated";

grant delete on table "public"."job_reports" to "service_role";

grant insert on table "public"."job_reports" to "service_role";

grant references on table "public"."job_reports" to "service_role";

grant select on table "public"."job_reports" to "service_role";

grant trigger on table "public"."job_reports" to "service_role";

grant truncate on table "public"."job_reports" to "service_role";

grant update on table "public"."job_reports" to "service_role";

grant delete on table "public"."join_requests" to "anon";

grant insert on table "public"."join_requests" to "anon";

grant references on table "public"."join_requests" to "anon";

grant select on table "public"."join_requests" to "anon";

grant trigger on table "public"."join_requests" to "anon";

grant truncate on table "public"."join_requests" to "anon";

grant update on table "public"."join_requests" to "anon";

grant delete on table "public"."join_requests" to "authenticated";

grant insert on table "public"."join_requests" to "authenticated";

grant references on table "public"."join_requests" to "authenticated";

grant select on table "public"."join_requests" to "authenticated";

grant trigger on table "public"."join_requests" to "authenticated";

grant truncate on table "public"."join_requests" to "authenticated";

grant update on table "public"."join_requests" to "authenticated";

grant delete on table "public"."join_requests" to "service_role";

grant insert on table "public"."join_requests" to "service_role";

grant references on table "public"."join_requests" to "service_role";

grant select on table "public"."join_requests" to "service_role";

grant trigger on table "public"."join_requests" to "service_role";

grant truncate on table "public"."join_requests" to "service_role";

grant update on table "public"."join_requests" to "service_role";

grant delete on table "public"."system_types" to "anon";

grant insert on table "public"."system_types" to "anon";

grant references on table "public"."system_types" to "anon";

grant select on table "public"."system_types" to "anon";

grant trigger on table "public"."system_types" to "anon";

grant truncate on table "public"."system_types" to "anon";

grant update on table "public"."system_types" to "anon";

grant delete on table "public"."system_types" to "authenticated";

grant insert on table "public"."system_types" to "authenticated";

grant references on table "public"."system_types" to "authenticated";

grant select on table "public"."system_types" to "authenticated";

grant trigger on table "public"."system_types" to "authenticated";

grant truncate on table "public"."system_types" to "authenticated";

grant update on table "public"."system_types" to "authenticated";

grant delete on table "public"."system_types" to "service_role";

grant insert on table "public"."system_types" to "service_role";

grant references on table "public"."system_types" to "service_role";

grant select on table "public"."system_types" to "service_role";

grant trigger on table "public"."system_types" to "service_role";

grant truncate on table "public"."system_types" to "service_role";

grant update on table "public"."system_types" to "service_role";

grant delete on table "public"."systems" to "anon";

grant insert on table "public"."systems" to "anon";

grant references on table "public"."systems" to "anon";

grant select on table "public"."systems" to "anon";

grant trigger on table "public"."systems" to "anon";

grant truncate on table "public"."systems" to "anon";

grant update on table "public"."systems" to "anon";

grant delete on table "public"."systems" to "authenticated";

grant insert on table "public"."systems" to "authenticated";

grant references on table "public"."systems" to "authenticated";

grant select on table "public"."systems" to "authenticated";

grant trigger on table "public"."systems" to "authenticated";

grant truncate on table "public"."systems" to "authenticated";

grant update on table "public"."systems" to "authenticated";

grant delete on table "public"."systems" to "service_role";

grant insert on table "public"."systems" to "service_role";

grant references on table "public"."systems" to "service_role";

grant select on table "public"."systems" to "service_role";

grant trigger on table "public"."systems" to "service_role";

grant truncate on table "public"."systems" to "service_role";

grant update on table "public"."systems" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Allow authenticated users to fetch addresses linked to their cl"
on "public"."addresses"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM clients
  WHERE ((clients.id = addresses.client_id) AND (clients.company_id = ( SELECT u.company_id
           FROM users u
          WHERE (u.id = auth.uid())))))));


create policy "Allow users to add addresses for clients in their company"
on "public"."addresses"
as permissive
for insert
to authenticated
with check ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = addresses.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow users to delete addresses linked to clients in their comp"
on "public"."addresses"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM clients
  WHERE ((clients.id = addresses.client_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))));


create policy "Allow users to update addresses linked to clients in their comp"
on "public"."addresses"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM clients
  WHERE ((clients.id = addresses.client_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))))
with check ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = addresses.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow users to add clients for their company"
on "public"."clients"
as permissive
for insert
to authenticated
with check ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())
 LIMIT 1)));


create policy "Allow users to delete clients if they are the admin of the comp"
on "public"."clients"
as permissive
for delete
to authenticated
using ((company_id IN ( SELECT companies.id
   FROM companies
  WHERE (companies.admin_id = ( SELECT auth.uid() AS uid)))));


create policy "Allow users to fetch clients from their company"
on "public"."clients"
as permissive
for select
to authenticated
using ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow users to update clients in their company"
on "public"."clients"
as permissive
for update
to authenticated
with check ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id));


create policy "Allow deletes for companies linked to the user"
on "public"."companies"
as permissive
for delete
to authenticated
using ((admin_id = auth.uid()));


create policy "Allow inserts for authenticated admins only"
on "public"."companies"
as permissive
for insert
to authenticated
with check ((( SELECT (users.raw_user_meta_data ->> 'status'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = 'ADMIN'::text));


create policy "Allow updates for companies linked to the user"
on "public"."companies"
as permissive
for update
to authenticated
using ((admin_id = auth.uid()));


create policy "Allow users to select their own company data"
on "public"."companies"
as permissive
for select
to authenticated
using ((((id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))) AND (( SELECT users.status
   FROM users
  WHERE (users.id = auth.uid())) = 'ADMIN'::text)) OR (( SELECT users.status
   FROM users
  WHERE (users.id = auth.uid())) = 'TECHNICIAN'::text)));


create policy "Allow deletes for company_uids by admins only"
on "public"."company_uids"
as permissive
for delete
to authenticated
using ((( SELECT (users.raw_user_meta_data ->> 'status'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = 'ADMIN'::text));


create policy "Allow inserts for company admins only"
on "public"."company_uids"
as permissive
for insert
to authenticated
with check ((( SELECT (users.raw_user_meta_data ->> 'status'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = 'ADMIN'::text));


create policy "Allow public read access to company_uids"
on "public"."company_uids"
as permissive
for select
to authenticated, anon
using (true);


create policy "Allow updates for company_uids by admins only"
on "public"."company_uids"
as permissive
for update
to authenticated
using ((( SELECT (users.raw_user_meta_data ->> 'status'::text)
   FROM auth.users
  WHERE (users.id = auth.uid())) = 'ADMIN'::text));


create policy "Allow authenticated users to delete forms linked to their compa"
on "public"."forms"
as permissive
for delete
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = ( SELECT system_types.company_id
   FROM system_types
  WHERE (system_types.id = forms.system_type_id))));


create policy "Allow authenticated users to insert forms linked to their compa"
on "public"."forms"
as permissive
for insert
to authenticated
with check ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = ( SELECT system_types.company_id
   FROM system_types
  WHERE (system_types.id = forms.system_type_id))));


create policy "Allow authenticated users to select forms linked to their compa"
on "public"."forms"
as permissive
for select
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = ( SELECT system_types.company_id
   FROM system_types
  WHERE (system_types.id = forms.system_type_id))));


create policy "Allow authenticated users to update forms linked to their compa"
on "public"."forms"
as permissive
for update
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = ( SELECT system_types.company_id
   FROM system_types
  WHERE (system_types.id = forms.system_type_id))))
with check ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = ( SELECT system_types.company_id
   FROM system_types
  WHERE (system_types.id = forms.system_type_id))));


create policy "Allow authenticated users to delete job reports for their compa"
on "public"."job_reports"
as permissive
for delete
to authenticated
using ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = job_reports.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow authenticated users to insert job reports for their compa"
on "public"."job_reports"
as permissive
for insert
to authenticated
with check ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = job_reports.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow authenticated users to read job reports for their company"
on "public"."job_reports"
as permissive
for select
to authenticated
using ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = job_reports.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow authenticated users to update job reports for their compa"
on "public"."job_reports"
as permissive
for update
to authenticated
using ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = job_reports.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))))
with check ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = job_reports.client_id)) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow users to delete their own join requests"
on "public"."join_requests"
as permissive
for delete
to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT companies.company_uid
   FROM companies
  WHERE (companies.id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))) = company_uid)));


create policy "Allow users to insert join requests"
on "public"."join_requests"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Allow users to select their or their companies join requests"
on "public"."join_requests"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT companies.company_uid
   FROM companies
  WHERE (companies.id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))) = company_uid)));


create policy "Allow users to update join requests for their company"
on "public"."join_requests"
as permissive
for update
to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR (( SELECT companies.company_uid
   FROM companies
  WHERE (companies.id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))) = company_uid)));


create policy "Allow authenticated users to delete system types for their comp"
on "public"."system_types"
as permissive
for delete
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id));


create policy "Allow authenticated users to insert system types for their comp"
on "public"."system_types"
as permissive
for insert
to authenticated
with check ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id));


create policy "Allow authenticated users to read system types for their compan"
on "public"."system_types"
as permissive
for select
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id));


create policy "Allow authenticated users to update system types for their comp"
on "public"."system_types"
as permissive
for update
to authenticated
using ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id))
with check ((( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid())) = company_id));


create policy "Allow users to delete systems linked to addresses of clients in"
on "public"."systems"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM (addresses
     JOIN clients ON ((addresses.client_id = clients.id)))
  WHERE ((addresses.id = systems.address_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))));


create policy "Allow users to insert systems linked to addresses of clients in"
on "public"."systems"
as permissive
for insert
to authenticated
with check ((( SELECT clients.company_id
   FROM clients
  WHERE (clients.id = ( SELECT addresses.client_id
           FROM addresses
          WHERE (addresses.id = systems.address_id)))) = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));


create policy "Allow users to read systems linked to addresses of clients in t"
on "public"."systems"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (addresses
     JOIN clients ON ((addresses.client_id = clients.id)))
  WHERE ((addresses.id = systems.address_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))));


create policy "Allow users to update systems linked to addresses of clients in"
on "public"."systems"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM (addresses
     JOIN clients ON ((addresses.client_id = clients.id)))
  WHERE ((addresses.id = systems.address_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))))
with check ((EXISTS ( SELECT 1
   FROM (addresses
     JOIN clients ON ((addresses.client_id = clients.id)))
  WHERE ((addresses.id = systems.address_id) AND (clients.company_id = ( SELECT users.company_id
           FROM users
          WHERE (users.id = auth.uid())))))));


create policy "Allow users to select other users from their own company"
on "public"."users"
as permissive
for select
to authenticated
using (private.is_company_admin(company_id));


create policy "Allow users to select their own user"
on "public"."users"
as permissive
for select
to authenticated
using (((auth.uid() IS NOT NULL) AND (id = auth.uid())));


create policy "Allows company admins to update users from their company"
on "public"."users"
as permissive
for update
to authenticated
using (private.is_company_admin(company_id));


create policy "Enable delete for users based on user.id"
on "public"."users"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable insert for authenticated users"
on "public"."users"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to update their own user row"
on "public"."users"
as permissive
for update
to authenticated
using ((auth.uid() = id));


CREATE TRIGGER set_address_format AFTER INSERT OR UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION format_address();

CREATE TRIGGER set_address_string BEFORE INSERT OR UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION format_address();

CREATE TRIGGER after_insert_company_uid AFTER INSERT ON public.companies FOR EACH ROW EXECUTE FUNCTION private.insert_company_uid();

CREATE TRIGGER after_system_type_insert AFTER INSERT ON public.system_types FOR EACH ROW EXECUTE FUNCTION insert_form_after_system_type();


