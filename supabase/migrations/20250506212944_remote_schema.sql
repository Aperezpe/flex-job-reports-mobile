

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgtap" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "private"."handle_user_registration"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  -- Constants
  ADMIN_STATUS CONSTANT TEXT := 'ADMIN';
  PENDING_STATUS CONSTANT TEXT := 'PENDING';
  -- Variables
  new_company_id UUID;  -- ID of the newly created company
  existing_company_id UUID; -- ID of the fetched existing company
  user_meta_data JSONB; -- To extract user meta data
  user_full_name TEXT; -- to extract full name coming from client
  user_phone TEXT; -- To extract phone number coming from client
  input_company_uid TEXT; -- To extract Company UID coming from client
  company_name TEXT; -- To extract Company Name coming from client
  user_status TEXT; -- To extract 'status' from user metadata
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
    INSERT INTO public.users (id, full_name, status)
    VALUES (NEW.id, user_full_name, PENDING_STATUS);

    -- Insert into join_requests
    INSERT INTO public.join_requests(company_uid, user_id)
    VALUES (input_company_uid, NEW.id);
  END IF;
  -- Prevent modifying the auth.users table row
  RETURN NULL;
END;$$;


ALTER FUNCTION "private"."handle_user_registration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."insert_company_uid"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Insert the new company_uid into the company_uids table
  INSERT INTO public.company_uids (company_uid)
  VALUES (NEW.company_uid);
  
  RETURN NEW; -- Return the new row
END;$$;


ALTER FUNCTION "private"."insert_company_uid"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."is_company_admin"("target_company_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
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
END;$$;


ALTER FUNCTION "private"."is_company_admin"("target_company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."update_company_id_to_null"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    RAISE LOG 'update_company_id_to_null called';
    RAISE LOG 'update_company_id_to_null: Row updated: %', row_to_json(NEW);
    
    IF NEW.status = 'IDLE' AND OLD.status IS DISTINCT FROM 'IDLE' THEN
        RAISE LOG 'update_company_id_to_null: Updating same row to null out company_id';

        UPDATE public.users 
        SET company_id = NULL
        WHERE id = NEW.id AND company_id IS NOT NULL;

        RAISE LOG 'update_company_id_to_null: company_id updated to NULL';
    END IF;
    
    RETURN NULL;
END;$$;


ALTER FUNCTION "private"."update_company_id_to_null"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "private"."update_user_status_on_acceptance"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    IF NEW.status = 'ACCEPTED' THEN
        -- Update the user's status to "TECHNICIAN" and set company_id
        UPDATE users
        SET status = 'TECHNICIAN',
            company_id = (SELECT id FROM companies WHERE company_uid = NEW.company_uid)
        WHERE id = NEW.user_id;

        -- Delete the join request
        DELETE FROM join_requests
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;$$;


ALTER FUNCTION "private"."update_user_status_on_acceptance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."format_address"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."format_address"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_company_uid"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert the new company_uid into the company_uids table
  INSERT INTO public.company_uids (company_uid)
  VALUES (NEW.company_uid);
  
  RETURN NEW; -- Return the new row
END;
$$;


ALTER FUNCTION "public"."insert_company_uid"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_form_after_system_type"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.forms (system_type_id)
    VALUES (NEW.id); -- Link the new form to the system_type_id
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."insert_form_after_system_type"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "address_title" "text",
    "address_street" "text" NOT NULL,
    "address_street_2" "text",
    "address_city" "text",
    "address_state" "text",
    "address_zip_code" "text",
    "client_id" bigint NOT NULL,
    "address_string" "text"
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


ALTER TABLE "public"."addresses" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."addresses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_name" "text" NOT NULL,
    "client_company_name" "text",
    "client_phone_number" "text",
    "company_id" "uuid"
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


ALTER TABLE "public"."clients" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."clients_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_name" "text" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_uid" "text" NOT NULL,
    "config" "jsonb"
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."companies"."config" IS 'Configuration for the company';



CREATE TABLE IF NOT EXISTS "public"."company_uids" (
    "company_uid" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."company_uids" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_uids" IS 'All Company User Created Unique IDs';



CREATE TABLE IF NOT EXISTS "public"."forms" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "system_type_id" bigint NOT NULL,
    "schema" "jsonb" DEFAULT '{"sections": [{"id": 0, "title": "Default Info", "fields": [{"id": 0, "type": "info_section", "title": "Dummy, but necessary", "required": true}]}]}'::"jsonb"
);


ALTER TABLE "public"."forms" OWNER TO "postgres";


COMMENT ON TABLE "public"."forms" IS 'Stores the forms available for each company';



ALTER TABLE "public"."forms" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."forms_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."job_reports" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "system_id" bigint NOT NULL,
    "job_report" "jsonb" NOT NULL,
    "client_id" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."job_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."join_requests" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_uid" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" "text",
    "status" "text"
);


ALTER TABLE "public"."join_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."join_requests" IS 'Requests to join companies. Each user can only have one join request at a time.';



COMMENT ON COLUMN "public"."join_requests"."user_name" IS 'name of the user';



COMMENT ON COLUMN "public"."join_requests"."status" IS 'request status';



ALTER TABLE "public"."join_requests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."join_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."system_types" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "system_type" "text" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "visible" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."system_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."system_types" IS 'System Types by company';



COMMENT ON COLUMN "public"."system_types"."visible" IS 'To hide/show system type in UI';



ALTER TABLE "public"."system_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."system_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."systems" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "system_name" "text" NOT NULL,
    "address_id" bigint NOT NULL,
    "area" "text",
    "tonnage" real,
    "last_service" timestamp with time zone,
    "system_type_id" bigint
);


ALTER TABLE "public"."systems" OWNER TO "postgres";


ALTER TABLE "public"."systems" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."systems_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "full_name" "text" DEFAULT ''::"text",
    "status" "text",
    "company_id" "uuid",
    "phone_number" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_company_uid_key" UNIQUE ("company_uid");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_uids"
    ADD CONSTRAINT "company_uids_company_uid_key" UNIQUE ("company_uid");



ALTER TABLE ONLY "public"."company_uids"
    ADD CONSTRAINT "company_uids_pkey" PRIMARY KEY ("company_uid");



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."join_requests"
    ADD CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_types"
    ADD CONSTRAINT "system_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."systems"
    ADD CONSTRAINT "systems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "after_insert_company_uid" AFTER INSERT ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "private"."insert_company_uid"();



CREATE OR REPLACE TRIGGER "after_system_type_insert" AFTER INSERT ON "public"."system_types" FOR EACH ROW EXECUTE FUNCTION "public"."insert_form_after_system_type"();



CREATE OR REPLACE TRIGGER "on_join_request_update" AFTER UPDATE OF "status" ON "public"."join_requests" FOR EACH ROW WHEN (("new"."status" = 'ACCEPTED'::"text")) EXECUTE FUNCTION "private"."update_user_status_on_acceptance"();



CREATE OR REPLACE TRIGGER "on_update_user_to_idle" AFTER UPDATE ON "public"."users" FOR EACH ROW WHEN ((("old"."status" IS DISTINCT FROM 'IDLE'::"text") AND ("new"."status" = 'IDLE'::"text"))) EXECUTE FUNCTION "private"."update_company_id_to_null"();



CREATE OR REPLACE TRIGGER "set_address_format" AFTER INSERT OR UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION "public"."format_address"();



CREATE OR REPLACE TRIGGER "set_address_string" BEFORE INSERT OR UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION "public"."format_address"();



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_uids"
    ADD CONSTRAINT "company_uids_company_uid_fkey" FOREIGN KEY ("company_uid") REFERENCES "public"."companies"("company_uid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forms"
    ADD CONSTRAINT "forms_system_type_id_fkey" FOREIGN KEY ("system_type_id") REFERENCES "public"."system_types"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."join_requests"
    ADD CONSTRAINT "join_requests_company_uid_fkey" FOREIGN KEY ("company_uid") REFERENCES "public"."companies"("company_uid") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."join_requests"
    ADD CONSTRAINT "join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "service_jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "service_jobs_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id");



ALTER TABLE ONLY "public"."system_types"
    ADD CONSTRAINT "system_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."systems"
    ADD CONSTRAINT "systems_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."systems"
    ADD CONSTRAINT "systems_system_type_id_fkey" FOREIGN KEY ("system_type_id") REFERENCES "public"."system_types"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to delete forms linked to their compa" ON "public"."forms" FOR DELETE TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = ( SELECT "system_types"."company_id"
   FROM "public"."system_types"
  WHERE ("system_types"."id" = "forms"."system_type_id"))));



CREATE POLICY "Allow authenticated users to delete job reports for their compa" ON "public"."job_reports" FOR DELETE TO "authenticated" USING ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "job_reports"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to delete system types for their comp" ON "public"."system_types" FOR DELETE TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Allow authenticated users to fetch addresses linked to their cl" ON "public"."addresses" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "addresses"."client_id") AND ("clients"."company_id" = ( SELECT "u"."company_id"
           FROM "public"."users" "u"
          WHERE ("u"."id" = "auth"."uid"())))))));



CREATE POLICY "Allow authenticated users to insert forms linked to their compa" ON "public"."forms" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = ( SELECT "system_types"."company_id"
   FROM "public"."system_types"
  WHERE ("system_types"."id" = "forms"."system_type_id"))));



CREATE POLICY "Allow authenticated users to insert job reports for their compa" ON "public"."job_reports" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "job_reports"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to insert system types for their comp" ON "public"."system_types" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Allow authenticated users to read job reports for their company" ON "public"."job_reports" FOR SELECT TO "authenticated" USING ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "job_reports"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to read system types for their compan" ON "public"."system_types" FOR SELECT TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Allow authenticated users to select forms linked to their compa" ON "public"."forms" FOR SELECT TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = ( SELECT "system_types"."company_id"
   FROM "public"."system_types"
  WHERE ("system_types"."id" = "forms"."system_type_id"))));



CREATE POLICY "Allow authenticated users to update forms linked to their compa" ON "public"."forms" FOR UPDATE TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = ( SELECT "system_types"."company_id"
   FROM "public"."system_types"
  WHERE ("system_types"."id" = "forms"."system_type_id")))) WITH CHECK ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = ( SELECT "system_types"."company_id"
   FROM "public"."system_types"
  WHERE ("system_types"."id" = "forms"."system_type_id"))));



CREATE POLICY "Allow authenticated users to update job reports for their compa" ON "public"."job_reports" FOR UPDATE TO "authenticated" USING ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "job_reports"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())))) WITH CHECK ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "job_reports"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to update system types for their comp" ON "public"."system_types" FOR UPDATE TO "authenticated" USING ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id")) WITH CHECK ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Allow deletes for companies linked to the user" ON "public"."companies" FOR DELETE TO "authenticated" USING (("admin_id" = "auth"."uid"()));



CREATE POLICY "Allow deletes for company_uids by admins only" ON "public"."company_uids" FOR DELETE TO "authenticated" USING ((( SELECT ("users"."raw_user_meta_data" ->> 'status'::"text")
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'ADMIN'::"text"));



CREATE POLICY "Allow inserts for authenticated admins only" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT ("users"."raw_user_meta_data" ->> 'status'::"text")
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'ADMIN'::"text"));



CREATE POLICY "Allow inserts for company admins only" ON "public"."company_uids" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT ("users"."raw_user_meta_data" ->> 'status'::"text")
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'ADMIN'::"text"));



CREATE POLICY "Allow public read access to company_uids" ON "public"."company_uids" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow updates for companies linked to the user" ON "public"."companies" FOR UPDATE TO "authenticated" USING (("admin_id" = "auth"."uid"()));



CREATE POLICY "Allow updates for company_uids by admins only" ON "public"."company_uids" FOR UPDATE TO "authenticated" USING ((( SELECT ("users"."raw_user_meta_data" ->> 'status'::"text")
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'ADMIN'::"text"));



CREATE POLICY "Allow users to add addresses for clients in their company" ON "public"."addresses" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "addresses"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow users to add clients for their company" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (("company_id" = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Allow users to delete addresses linked to clients in their comp" ON "public"."addresses" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "addresses"."client_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



CREATE POLICY "Allow users to delete clients if they are the admin of the comp" ON "public"."clients" FOR DELETE TO "authenticated" USING (("company_id" IN ( SELECT "companies"."id"
   FROM "public"."companies"
  WHERE ("companies"."admin_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Allow users to delete systems linked to addresses of clients in" ON "public"."systems" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."addresses"
     JOIN "public"."clients" ON (("addresses"."client_id" = "clients"."id")))
  WHERE (("addresses"."id" = "systems"."address_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



CREATE POLICY "Allow users to delete their own join requests" ON "public"."join_requests" FOR DELETE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (( SELECT "companies"."company_uid"
   FROM "public"."companies"
  WHERE ("companies"."id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))) = "company_uid")));



CREATE POLICY "Allow users to fetch clients from their company" ON "public"."clients" FOR SELECT TO "authenticated" USING (("company_id" = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow users to insert join requests" ON "public"."join_requests" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow users to insert systems linked to addresses of clients in" ON "public"."systems" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = ( SELECT "addresses"."client_id"
           FROM "public"."addresses"
          WHERE ("addresses"."id" = "systems"."address_id")))) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow users to read systems linked to addresses of clients in t" ON "public"."systems" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."addresses"
     JOIN "public"."clients" ON (("addresses"."client_id" = "clients"."id")))
  WHERE (("addresses"."id" = "systems"."address_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



CREATE POLICY "Allow users to select other users from their own company" ON "public"."users" FOR SELECT TO "authenticated" USING ("private"."is_company_admin"("company_id"));



CREATE POLICY "Allow users to select their or their companies join requests" ON "public"."join_requests" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (( SELECT "companies"."company_uid"
   FROM "public"."companies"
  WHERE ("companies"."id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))) = "company_uid")));



CREATE POLICY "Allow users to select their own company data" ON "public"."companies" FOR SELECT TO "authenticated" USING (((("id" = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))) AND (( SELECT "users"."status"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'ADMIN'::"text")) OR (( SELECT "users"."status"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'TECHNICIAN'::"text")));



CREATE POLICY "Allow users to select their own user" ON "public"."users" FOR SELECT TO "authenticated" USING ((("auth"."uid"() IS NOT NULL) AND ("id" = "auth"."uid"())));



CREATE POLICY "Allow users to update addresses linked to clients in their comp" ON "public"."addresses" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clients"
  WHERE (("clients"."id" = "addresses"."client_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"()))))))) WITH CHECK ((( SELECT "clients"."company_id"
   FROM "public"."clients"
  WHERE ("clients"."id" = "addresses"."client_id")) = ( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow users to update clients in their company" ON "public"."clients" FOR UPDATE TO "authenticated" WITH CHECK ((( SELECT "users"."company_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = "company_id"));



CREATE POLICY "Allow users to update join requests for their company" ON "public"."join_requests" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (( SELECT "companies"."company_uid"
   FROM "public"."companies"
  WHERE ("companies"."id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))) = "company_uid")));



CREATE POLICY "Allow users to update systems linked to addresses of clients in" ON "public"."systems" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."addresses"
     JOIN "public"."clients" ON (("addresses"."client_id" = "clients"."id")))
  WHERE (("addresses"."id" = "systems"."address_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"()))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."addresses"
     JOIN "public"."clients" ON (("addresses"."client_id" = "clients"."id")))
  WHERE (("addresses"."id" = "systems"."address_id") AND ("clients"."company_id" = ( SELECT "users"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())))))));



CREATE POLICY "Allows company admins to update users from their company" ON "public"."users" FOR UPDATE TO "authenticated" USING ("private"."is_company_admin"("company_id"));



CREATE POLICY "Enable delete for users based on user.id" ON "public"."users" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable users to update their own user row" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_uids" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."join_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."systems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."_add"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_add"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_add"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_add"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_add"("text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_add"("text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_add"("text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_add"("text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_alike"(boolean, "anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_alike"(boolean, "anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_alike"(boolean, "anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_alike"(boolean, "anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", "name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", "name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", "name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ancestor_of"("name", "name", "name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_are"("text", "name"[], "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_are"("text", "name"[], "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_are"("text", "name"[], "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_are"("text", "name"[], "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_areni"("text", "text"[], "text"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_areni"("text", "text"[], "text"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_areni"("text", "text"[], "text"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_areni"("text", "text"[], "text"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_array_to_sorted_string"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_array_to_sorted_string"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_array_to_sorted_string"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_array_to_sorted_string"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_assets_are"("text", "text"[], "text"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_assets_are"("text", "text"[], "text"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_assets_are"("text", "text"[], "text"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_assets_are"("text", "text"[], "text"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cast_exists"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "name", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "name", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "name", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cdi"("name", "name", "name", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cexists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_cexists"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cexists"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ckeys"("name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_ckeys"("name", "name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", "name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", "name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ckeys"("name", "name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_cleanup"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_cleanup"() TO "anon";
GRANT ALL ON FUNCTION "public"."_cleanup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cleanup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_cmp_types"("oid", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_cmp_types"("oid", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_cmp_types"("oid", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_cmp_types"("oid", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "name", "text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "name", "text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "name", "text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_col_is_null"("name", "name", "name", "text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_constraint"("name", character, "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_constraint"("name", character, "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_constraint"("name", character, "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_constraint"("name", character, "name"[], "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_constraint"("name", "name", character, "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_constraint"("name", "name", character, "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_constraint"("name", "name", character, "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_constraint"("name", "name", character, "name"[], "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_contract_on"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_contract_on"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_contract_on"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_contract_on"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_currtest"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_currtest"() TO "anon";
GRANT ALL ON FUNCTION "public"."_currtest"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_currtest"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_db_privs"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_db_privs"() TO "anon";
GRANT ALL ON FUNCTION "public"."_db_privs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_db_privs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_def_is"("text", "text", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_def_is"("text", "text", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_def_is"("text", "text", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_def_is"("text", "text", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_definer"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_definer"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_definer"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_definer"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_definer"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_definer"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_definer"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_definer"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_dexists"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_dexists"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_dexists"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dexists"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_dexists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_dexists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_dexists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_dexists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_do_ne"("text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_do_ne"("text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_do_ne"("text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_do_ne"("text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_docomp"("text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_docomp"("text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_docomp"("text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_docomp"("text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_error_diag"("text", "text", "text", "text", "text", "text", "text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_error_diag"("text", "text", "text", "text", "text", "text", "text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_error_diag"("text", "text", "text", "text", "text", "text", "text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_error_diag"("text", "text", "text", "text", "text", "text", "text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_expand_context"(character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_expand_context"(character) TO "anon";
GRANT ALL ON FUNCTION "public"."_expand_context"(character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_expand_context"(character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_expand_on"(character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_expand_on"(character) TO "anon";
GRANT ALL ON FUNCTION "public"."_expand_on"(character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_expand_on"(character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_expand_vol"(character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_expand_vol"(character) TO "anon";
GRANT ALL ON FUNCTION "public"."_expand_vol"(character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_expand_vol"(character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_ext_exists"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ext_exists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ext_exists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_extensions"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_extensions"() TO "anon";
GRANT ALL ON FUNCTION "public"."_extensions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extensions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_extensions"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_extensions"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_extensions"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extensions"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_extras"(character[], "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_extras"(character, "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_extras"(character[], "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extras"(character[], "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_extras"(character, "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_extras"(character, "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_finish"(integer, integer, integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_finish"(integer, integer, integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_finish"(integer, integer, integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_finish"(integer, integer, integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_fkexists"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_fprivs_are"("text", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_fprivs_are"("text", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_fprivs_are"("text", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_fprivs_are"("text", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "anyelement", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "anyelement", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "anyelement", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "anyelement", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], "anyelement", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], "anyelement", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], "anyelement", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_func_compare"("name", "name", "name"[], "anyelement", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_funkargs"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_funkargs"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_funkargs"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_funkargs"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_ac_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_ac_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_ac_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_ac_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_col_ns_type"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_col_ns_type"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_col_ns_type"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_col_ns_type"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_col_privs"("name", "text", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_col_privs"("name", "text", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_col_privs"("name", "text", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_col_privs"("name", "text", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_col_type"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_context"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_context"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_context"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_context"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_db_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_db_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_db_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_db_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_db_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_db_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_db_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_db_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_dtype"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_dtype"("name", "text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name", "text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name", "text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_dtype"("name", "text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_fdw_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_fdw_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_fdw_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_fdw_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_func_owner"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_func_privs"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_func_privs"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_func_privs"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_func_privs"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_index_owner"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_lang_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_lang_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_lang_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_lang_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_language_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_language_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_language_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_language_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_latest"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_latest"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_latest"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_latest"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_latest"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_latest"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_get_latest"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_latest"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_note"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_note"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_get_note"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_note"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_note"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_note"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_note"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_note"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_opclass_owner"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character[], "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_rel_owner"(character, "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_schema_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_schema_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_schema_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_schema_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_schema_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_schema_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_schema_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_schema_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_sequence_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_sequence_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_sequence_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_sequence_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_server_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_server_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_server_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_server_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_table_privs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_table_privs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_table_privs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_table_privs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_tablespace_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_tablespace_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_tablespace_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_tablespace_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_tablespaceprivs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_tablespaceprivs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_tablespaceprivs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_tablespaceprivs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_type_owner"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_get_type_owner"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_get_type_owner"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_got_func"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_got_func"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_got_func"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_got_func"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_got_func"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_got_func"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_got_func"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_got_func"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_grolist"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_grolist"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_grolist"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_grolist"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_def"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_def"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_def"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_group"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_group"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_has_group"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_group"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_role"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_role"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_has_role"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_role"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_type"("name", character[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_type"("name", character[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_has_type"("name", character[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_type"("name", character[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_type"("name", "name", character[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_type"("name", "name", character[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_has_type"("name", "name", character[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_type"("name", "name", character[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_has_user"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_has_user"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_has_user"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_has_user"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_hasc"("name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_hasc"("name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_hasc"("name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_hasc"("name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_hasc"("name", "name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_hasc"("name", "name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_hasc"("name", "name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_hasc"("name", "name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_have_index"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_have_index"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_have_index"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ident_array_to_sorted_string"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ident_array_to_sorted_string"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_ident_array_to_sorted_string"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ident_array_to_sorted_string"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ident_array_to_string"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ident_array_to_string"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_ident_array_to_string"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ident_array_to_string"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_ikeys"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_inherited"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_inherited"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_inherited"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_inherited"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_inherited"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_inherited"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_inherited"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_inherited"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_indexed"("name", "name", "text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_indexed"("name", "name", "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_is_indexed"("name", "name", "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_indexed"("name", "name", "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_instead"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_schema"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_schema"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_is_schema"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_schema"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_super"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_super"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_is_super"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_super"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_trusted"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_trusted"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_is_trusted"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_trusted"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_is_verbose"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_is_verbose"() TO "anon";
GRANT ALL ON FUNCTION "public"."_is_verbose"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_is_verbose"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_keys"("name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_keys"("name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_keys"("name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_keys"("name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_keys"("name", "name", character) TO "postgres";
GRANT ALL ON FUNCTION "public"."_keys"("name", "name", character) TO "anon";
GRANT ALL ON FUNCTION "public"."_keys"("name", "name", character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_keys"("name", "name", character) TO "service_role";



GRANT ALL ON FUNCTION "public"."_lang"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_lang"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_lang"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_lang"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_lang"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_lang"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_lang"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_lang"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_missing"(character[], "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_missing"(character, "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_missing"(character[], "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_missing"(character[], "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_missing"(character, "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_missing"(character, "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_nosuch"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_nosuch"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_nosuch"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_nosuch"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_op_exists"("name", "name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_opc_exists"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_opc_exists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_opc_exists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_partof"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_partof"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_partof"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_parts"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_parts"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_parts"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_parts"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_parts"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_parts"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_parts"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_parts"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_pg_sv_column_array"("oid", smallint[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_pg_sv_column_array"("oid", smallint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_pg_sv_column_array"("oid", smallint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_pg_sv_column_array"("oid", smallint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_pg_sv_table_accessible"("oid", "oid") TO "postgres";
GRANT ALL ON FUNCTION "public"."_pg_sv_table_accessible"("oid", "oid") TO "anon";
GRANT ALL ON FUNCTION "public"."_pg_sv_table_accessible"("oid", "oid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_pg_sv_table_accessible"("oid", "oid") TO "service_role";



GRANT ALL ON FUNCTION "public"."_pg_sv_type_array"("oid"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_pg_sv_type_array"("oid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_pg_sv_type_array"("oid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_pg_sv_type_array"("oid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_prokind"("p_oid" "oid") TO "postgres";
GRANT ALL ON FUNCTION "public"."_prokind"("p_oid" "oid") TO "anon";
GRANT ALL ON FUNCTION "public"."_prokind"("p_oid" "oid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_prokind"("p_oid" "oid") TO "service_role";



GRANT ALL ON FUNCTION "public"."_query"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_query"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_query"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_query"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_quote_ident_like"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_quote_ident_like"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_quote_ident_like"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_quote_ident_like"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_refine_vol"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_refine_vol"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_refine_vol"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_refine_vol"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relcomp"("text", "anyarray", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "anyarray", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "anyarray", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "anyarray", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relcomp"("text", "text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relexists"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relexists"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_relexists"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relexists"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relexists"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relexists"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_relexists"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relexists"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relne"("text", "anyarray", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relne"("text", "anyarray", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_relne"("text", "anyarray", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relne"("text", "anyarray", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_relne"("text", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_relne"("text", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_relne"("text", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_relne"("text", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_returns"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_returns"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_returns"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_returns"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_returns"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_returns"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_returns"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_returns"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_rexists"(character, "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rexists"(character[], "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_rexists"(character, "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rexists"(character, "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_rule_on"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_runem"("text"[], boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."_runem"("text"[], boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."_runem"("text"[], boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_runem"("text"[], boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."_runner"("text"[], "text"[], "text"[], "text"[], "text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_runner"("text"[], "text"[], "text"[], "text"[], "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_runner"("text"[], "text"[], "text"[], "text"[], "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_runner"("text"[], "text"[], "text"[], "text"[], "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_set"(integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_set"(integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_set"(integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_set"(integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_set"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."_set"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."_set"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_set"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."_set"("text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_set"("text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_set"("text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_set"("text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_strict"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_strict"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_strict"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_strict"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_strict"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_strict"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_strict"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_strict"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_table_privs"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_table_privs"() TO "anon";
GRANT ALL ON FUNCTION "public"."_table_privs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_table_privs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_temptable"("anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_temptable"("anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_temptable"("anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_temptable"("anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_temptable"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_temptable"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_temptable"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_temptable"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_temptypes"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_temptypes"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."_temptypes"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_temptypes"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_time_trials"("text", integer, numeric) TO "postgres";
GRANT ALL ON FUNCTION "public"."_time_trials"("text", integer, numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."_time_trials"("text", integer, numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_time_trials"("text", integer, numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."_tlike"(boolean, "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_tlike"(boolean, "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_tlike"(boolean, "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_tlike"(boolean, "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_todo"() TO "postgres";
GRANT ALL ON FUNCTION "public"."_todo"() TO "anon";
GRANT ALL ON FUNCTION "public"."_todo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."_todo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."_trig"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_trig"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_trig"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_type_func"("char", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_type_func"("char", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_types_are"("name"[], "text", character[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_types_are"("name"[], "text", character[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_types_are"("name"[], "text", character[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_types_are"("name"[], "text", character[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_types_are"("name", "name"[], "text", character[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_types_are"("name", "name"[], "text", character[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_types_are"("name", "name"[], "text", character[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_types_are"("name", "name"[], "text", character[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_unalike"(boolean, "anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."_unalike"(boolean, "anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."_unalike"(boolean, "anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_unalike"(boolean, "anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."_vol"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_vol"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."_vol"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_vol"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_vol"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."_vol"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."_vol"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_vol"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_result"(boolean, boolean, "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."add_result"(boolean, boolean, "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_result"(boolean, boolean, "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_result"(boolean, boolean, "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."alike"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."any_column_privs_are"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_eq"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_has"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_has"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_has"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_hasnt"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bag_ne"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."can"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."can"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."can"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."can"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cast_context_is"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."casts_are"("text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."casts_are"("text"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."casts_are"("text"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_test"("text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text", boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text", boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text", boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_test"("text", boolean, "text", "text", "text", boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cmp_ok"("anyelement", "text", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_default_is"("name", "name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_check"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_has_default"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_hasnt_default"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_fk"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_null"("table_name" "name", "column_name" "name", "description" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_null"("table_name" "name", "column_name" "name", "description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_null"("table_name" "name", "column_name" "name", "description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_null"("table_name" "name", "column_name" "name", "description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_pk"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_is_unique"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_fk"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_isnt_pk"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_not_null"("table_name" "name", "column_name" "name", "description" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_not_null"("table_name" "name", "column_name" "name", "description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_not_null"("table_name" "name", "column_name" "name", "description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_not_null"("table_name" "name", "column_name" "name", "description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_not_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_not_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_not_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_not_null"("schema_name" "name", "table_name" "name", "column_name" "name", "description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."col_type_is"("name", "name", "name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."collect_tap"(VARIADIC "text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."collect_tap"(VARIADIC "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."collect_tap"(VARIADIC "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."collect_tap"(VARIADIC "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."collect_tap"(character varying[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."collect_tap"(character varying[]) TO "anon";
GRANT ALL ON FUNCTION "public"."collect_tap"(character varying[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."collect_tap"(character varying[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_privs_are"("name", "name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."columns_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."composite_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."database_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."db_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."diag"(VARIADIC "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."diag"("msg" "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."diag"("msg" "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."diag"("msg" "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."diag"("msg" "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."diag"("msg" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."diag"("msg" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."diag"("msg" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."diag"("msg" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."diag_test_name"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."diag_test_name"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."diag_test_name"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."diag_test_name"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."display_oper"("name", "oid") TO "postgres";
GRANT ALL ON FUNCTION "public"."display_oper"("name", "oid") TO "anon";
GRANT ALL ON FUNCTION "public"."display_oper"("name", "oid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."display_oper"("name", "oid") TO "service_role";



GRANT ALL ON FUNCTION "public"."do_tap"() TO "postgres";
GRANT ALL ON FUNCTION "public"."do_tap"() TO "anon";
GRANT ALL ON FUNCTION "public"."do_tap"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."do_tap"() TO "service_role";



GRANT ALL ON FUNCTION "public"."do_tap"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."do_tap"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."do_tap"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."do_tap"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."do_tap"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."do_tap"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."do_tap"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."do_tap"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."do_tap"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."do_tap"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."do_tap"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."do_tap"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."doesnt_imatch"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."doesnt_match"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_is"("name", "text", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domain_type_isnt"("name", "text", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domains_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."domains_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domains_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."domains_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enum_has_labels"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."enums_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."enums_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enums_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enums_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."extensions_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."extensions_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extensions_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extensions_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fail"() TO "postgres";
GRANT ALL ON FUNCTION "public"."fail"() TO "anon";
GRANT ALL ON FUNCTION "public"."fail"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fail"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fail"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fail"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."fail"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fail"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fdw_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."findfuncs"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."findfuncs"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."findfuncs"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."findfuncs"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."findfuncs"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."findfuncs"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."findfuncs"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."findfuncs"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."findfuncs"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."finish"("exception_on_failure" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."finish"("exception_on_failure" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."finish"("exception_on_failure" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."finish"("exception_on_failure" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name"[], "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name"[], "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fk_ok"("name", "name", "name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_table_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."foreign_tables_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."format_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_address"() TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name"[], "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_lang_is"("name", "name", "name"[], "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name"[], "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name") TO "anon";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_owner_is"("name", "name", "name"[], "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name"[], "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_privs_are"("name", "name", "name"[], "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name"[], "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."function_returns"("name", "name", "name"[], "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."functions_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."functions_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."functions_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."functions_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."groups_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."groups_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."groups_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_cast"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_check"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_check"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_check"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_check"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_check"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_check"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_check"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_check"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_check"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_check"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_check"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_check"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_column"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_column"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_composite"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_composite"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_composite"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_composite"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_composite"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_composite"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_composite"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_domain"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_domain"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_domain"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_domain"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_domain"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_domain"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_domain"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_domain"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_enum"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_enum"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_enum"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_enum"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_enum"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_enum"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_enum"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_enum"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_extension"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_extension"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_extension"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_extension"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_extension"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_extension"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_extension"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_extension"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_fk"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_fk"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_fk"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_fk"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_fk"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_fk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_fk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_foreign_table"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_foreign_table"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_function"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_group"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_group"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_group"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_group"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_group"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_group"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_group"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_group"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_index"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_inherited_tables"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_language"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_language"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_language"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_language"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_language"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_language"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_language"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_language"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_leftop"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_materialized_view"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_materialized_view"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_opclass"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_opclass"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_opclass"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_opclass"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_opclass"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_opclass"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_operator"("name", "name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_pk"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_pk"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_pk"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_pk"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_pk"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_pk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_pk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_relation"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_relation"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_relation"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_relation"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_relation"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_relation"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_relation"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rightop"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_role"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_role"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rule"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_rule"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_schema"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_schema"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_schema"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_schema"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_schema"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_schema"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_schema"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_schema"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_sequence"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_sequence"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_sequence"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_sequence"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_sequence"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_sequence"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_table"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_table"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_table"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_table"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_table"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_table"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_table"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_table"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_table"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_table"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_table"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_tablespace"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_tablespace"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_trigger"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_type"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_type"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_type"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_type"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_type"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_type"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_type"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_type"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_type"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_type"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_type"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_unique"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_unique"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_unique"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_unique"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_unique"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_unique"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_unique"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_user"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_user"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_view"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_view"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_view"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_view"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_view"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_view"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_view"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_view"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_view"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_view"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_view"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_cast"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_column"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_composite"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_composite"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_domain"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_domain"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_enum"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_enum"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_extension"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_extension"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_fk"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_fk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_foreign_table"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_function"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_group"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_group"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_group"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_index"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_inherited_tables"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_language"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_language"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_language"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_leftop"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_materialized_view"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_opclass"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_operator"("name", "name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_pk"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_pk"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_relation"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_relation"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rightop"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_role"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_role"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_role"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_rule"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_schema"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_schema"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_schema"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_sequence"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_table"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_table"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_tablespace"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_trigger"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_type"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_type"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_user"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_user"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_user"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_view"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hasnt_view"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ialike"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."imatches"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."in_todo"() TO "postgres";
GRANT ALL ON FUNCTION "public"."in_todo"() TO "anon";
GRANT ALL ON FUNCTION "public"."in_todo"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."in_todo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_primary"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_primary"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_type"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_unique"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_is_unique"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."index_owner_is"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."indexes_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_company_uid"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_company_uid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_company_uid"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_form_after_system_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_form_after_system_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_form_after_system_type"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is"("anyelement", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_aggregate"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_ancestor_of"("name", "name", "name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_clustered"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_clustered"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_clustered"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_clustered"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_clustered"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_definer"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_descendent_of"("name", "name", "name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_empty"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_empty"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_empty"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_empty"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_empty"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_empty"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_empty"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_empty"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_indexed"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_normal_function"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partition_of"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partitioned"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_partitioned"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_procedure"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_strict"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_superuser"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_superuser"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_superuser"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superuser"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_superuser"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_superuser"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_superuser"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superuser"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_window"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype") TO "postgres";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype") TO "anon";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype") TO "service_role";



GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isa_ok"("anyelement", "regtype", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt"("anyelement", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_aggregate"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_ancestor_of"("name", "name", "name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_definer"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_descendent_of"("name", "name", "name", "name", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_empty"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_empty"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_empty"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_member_of"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_normal_function"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_partitioned"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_procedure"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_strict"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_superuser"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_superuser"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_superuser"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."isnt_window"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."language_is_trusted"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."language_is_trusted"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_is_trusted"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."language_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."languages_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."languages_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."languages_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lives_ok"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."lives_ok"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."lives_ok"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."lives_ok"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lives_ok"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."lives_ok"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."lives_ok"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."lives_ok"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."matches"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_view_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."materialized_views_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."no_plan"() TO "postgres";
GRANT ALL ON FUNCTION "public"."no_plan"() TO "anon";
GRANT ALL ON FUNCTION "public"."no_plan"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."no_plan"() TO "service_role";



GRANT ALL ON FUNCTION "public"."num_failed"() TO "postgres";
GRANT ALL ON FUNCTION "public"."num_failed"() TO "anon";
GRANT ALL ON FUNCTION "public"."num_failed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."num_failed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ok"(boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."ok"(boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."ok"(boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ok"(boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."ok"(boolean, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."ok"(boolean, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."ok"(boolean, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ok"(boolean, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclass_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."opclasses_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."operators_are"("text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."operators_are"("text"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."operators_are"("text"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."operators_are"("name", "text"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."os_name"() TO "postgres";
GRANT ALL ON FUNCTION "public"."os_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."os_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."os_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."partitions_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pass"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pass"() TO "anon";
GRANT ALL ON FUNCTION "public"."pass"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pass"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pass"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."pass"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."pass"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pass"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric) TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_ok"("text", numeric, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric) TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."performs_within"("text", numeric, numeric, integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."pg_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pg_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."pg_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pg_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pg_version_num"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pg_version_num"() TO "anon";
GRANT ALL ON FUNCTION "public"."pg_version_num"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pg_version_num"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pgtap_version"() TO "postgres";
GRANT ALL ON FUNCTION "public"."pgtap_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."pgtap_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."pgtap_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."plan"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."plan"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."plan"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."plan"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policies_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_cmd_is"("name", "name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."policy_roles_are"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."relation_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("refcursor", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_eq"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_eq"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("refcursor", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "refcursor", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."results_ne"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."results_ne"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."roles_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."roles_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."roles_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement") TO "postgres";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement") TO "anon";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement") TO "authenticated";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement") TO "service_role";



GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."row_eq"("text", "anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_instead"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rule_is_on"("name", "name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rules_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."runtests"() TO "postgres";
GRANT ALL ON FUNCTION "public"."runtests"() TO "anon";
GRANT ALL ON FUNCTION "public"."runtests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."runtests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."runtests"("name") TO "postgres";
GRANT ALL ON FUNCTION "public"."runtests"("name") TO "anon";
GRANT ALL ON FUNCTION "public"."runtests"("name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."runtests"("name") TO "service_role";



GRANT ALL ON FUNCTION "public"."runtests"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."runtests"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."runtests"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."runtests"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."runtests"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."runtests"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."runtests"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."runtests"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schema_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schema_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."schemas_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."schemas_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."schemas_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequence_privs_are"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequences_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sequences_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequences_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sequences_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."server_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_eq"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_eq"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_eq"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_has"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_has"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_has"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_hasnt"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray") TO "anon";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_ne"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "anyarray", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_ne"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_ne"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."skip"(integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."skip"(integer) TO "anon";
GRANT ALL ON FUNCTION "public"."skip"(integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."skip"(integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."skip"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."skip"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."skip"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."skip"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."skip"(integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."skip"(integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."skip"(integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."skip"(integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."skip"("why" "text", "how_many" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."skip"("why" "text", "how_many" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."skip"("why" "text", "how_many" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."skip"("why" "text", "how_many" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."table_privs_are"("name", "name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."tables_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."tables_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tables_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tables_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespace_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespace_privs_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tablespaces_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ilike"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_imatching"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_like"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_like"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_like"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_matching"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", character, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", character, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", character, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", character, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."throws_ok"("text", integer, "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."todo"("how_many" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."todo"("why" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."todo"("why" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."todo"("why" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo"("why" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."todo"("how_many" integer, "why" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer, "why" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer, "why" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo"("how_many" integer, "why" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."todo"("why" "text", "how_many" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."todo"("why" "text", "how_many" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."todo"("why" "text", "how_many" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo"("why" "text", "how_many" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."todo_end"() TO "postgres";
GRANT ALL ON FUNCTION "public"."todo_end"() TO "anon";
GRANT ALL ON FUNCTION "public"."todo_end"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo_end"() TO "service_role";



GRANT ALL ON FUNCTION "public"."todo_start"() TO "postgres";
GRANT ALL ON FUNCTION "public"."todo_start"() TO "anon";
GRANT ALL ON FUNCTION "public"."todo_start"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo_start"() TO "service_role";



GRANT ALL ON FUNCTION "public"."todo_start"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."todo_start"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."todo_start"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."todo_start"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_is"("name", "name", "name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."triggers_are"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."type_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."types_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."types_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."types_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."types_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."types_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."types_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."types_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."types_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."types_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unalike"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unialike"("anyelement", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."users_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."users_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."users_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."users_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."users_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."users_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."users_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."users_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name") TO "anon";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."view_owner_is"("name", "name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."views_are"("name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."views_are"("name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."views_are"("name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."views_are"("name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."views_are"("name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."views_are"("name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."views_are"("name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."views_are"("name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."views_are"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name"[], "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."volatility_is"("name", "name", "name"[], "text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."addresses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clients_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_uids" TO "anon";
GRANT ALL ON TABLE "public"."company_uids" TO "authenticated";
GRANT ALL ON TABLE "public"."company_uids" TO "service_role";



GRANT ALL ON TABLE "public"."forms" TO "anon";
GRANT ALL ON TABLE "public"."forms" TO "authenticated";
GRANT ALL ON TABLE "public"."forms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forms_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."job_reports" TO "anon";
GRANT ALL ON TABLE "public"."job_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."job_reports" TO "service_role";



GRANT ALL ON TABLE "public"."join_requests" TO "anon";
GRANT ALL ON TABLE "public"."join_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."join_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."join_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."join_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."join_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."system_types" TO "anon";
GRANT ALL ON TABLE "public"."system_types" TO "authenticated";
GRANT ALL ON TABLE "public"."system_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."system_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."system_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."system_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."systems" TO "anon";
GRANT ALL ON TABLE "public"."systems" TO "authenticated";
GRANT ALL ON TABLE "public"."systems" TO "service_role";



GRANT ALL ON SEQUENCE "public"."systems_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."systems_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."systems_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
