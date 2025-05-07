set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.hello_world()
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
  SELECT "Hello World";
END;$function$
;


