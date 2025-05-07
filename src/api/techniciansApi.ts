import { supabase } from "../config/supabase";
import { AppUserSQL, UserStatus } from "../types/Auth/AppUser";

export const fetchCompanyTechniciansApi = async (companyId: string) =>
  await supabase
    .from("users")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", UserStatus.TECHNICIAN)

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
