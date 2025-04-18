import { supabase } from "../config/supabase";
import { CompanyUIDResponse } from "../types/Company";
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

export const hideSystemTypeApi = async (
  systemTypeId: number
) => 
  await supabase
    .from('system_types')
    .update({ visible: false })
    .eq('id', systemTypeId)

export const getCompanyUIDApi = async (
    companyUID: string
  ): Promise<CompanyUIDResponse> => {
    const { data, error } = await supabase
      .from("company_uids")
      .select("company_uid")
      .eq("company_uid", companyUID)
      .single();

    return {
      data: {
        companyUID: data?.company_uid,
      },
      error,
    };
  };

export const leaveCompanyApi = async (userId?: string) =>
  await supabase
    .from("users")
    .update({ company_id: null, status: null })
    .eq("id", userId ?? '')
    .select("*")
    .single();