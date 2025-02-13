import { supabase } from "../config/supabase";
import { AddSystemTypeForm } from "../types/SystemType";

export const fetchCompanyAndUserApi = async (authUserId: string) =>
  await supabase
    .from("users")
    .select("*, companies!users_company_id_fkey(*, system_types(*))")
    .eq("id", authUserId)
    .single();

export const upsertSystemTypeApi = async (
  values: AddSystemTypeForm,
  companyId?: string,
  systemTypeId?: number
) =>
  await supabase
    .from("system_types")
    .upsert({
      id: systemTypeId ?? undefined,
      company_id: companyId,
      system_type: values.systemType,
    })
    .select("*")
    .single();
