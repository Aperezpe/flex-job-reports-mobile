import { supabase } from "../config/supabase";
import { AppUserSQL, UserStatus } from "../types/Auth/AppUser";

export const fetchCompanyTechniciansApi = async (companyId: string) =>
  await supabase
    .from("users")
    .select("*")
    .neq("status", "ADMIN")
    .eq("company_id", companyId);

export const updateTechnicianStatusApi = async (
  technicianId: string,
  status: UserStatus
) =>
  await supabase
    .from("users")
    .update<AppUserSQL>({
      status,
    })
    .eq("id", technicianId)
    .select("*")
    .single();
