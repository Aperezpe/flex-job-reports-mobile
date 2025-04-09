import { supabase } from "../config/supabase";

export const fetchCompanyTechniciansApi = async (companyId: string) =>
  await supabase
    .from("users")
    .select("*")
    .neq("status", "ADMIN")
    .eq("company_id", companyId);
