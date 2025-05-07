create trigger on_auth_user_created
after INSERT on auth.users for EACH row
execute FUNCTION private.handle_user_registration ();