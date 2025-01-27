import { supabase } from "../config/supabase";

export const fetchCompanyAndUserApi = async (authUserId: string) =>
  await supabase
    .from("users")
    .select("*, companies!users_company_id_fkey(*)")
    .eq("id", authUserId)
    .single();
