import { PostgrestError } from "@supabase/supabase-js"

// TODO: Take care of the "Unexpected any"
export interface Company {
  id?: string,
  companyName?: string,
  systemTypes?: string[],
  adminId?: string,
  forms?: unknown
  companyUID?: string,
}

export interface CompanySQL {
  id?: string,
  company_name?: string,
  system_types?: string[],
  admin_id?: string,
  forms?: unknown
  company_uid?: string,
}

export const mapCompanySQLToCompany = (sqlData?: CompanySQL): Company => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    companyName: sqlData.company_name,
    systemTypes: sqlData.system_types,
    adminId: sqlData.admin_id,
    forms: sqlData.forms,
    companyUID: sqlData.company_uid,
  };
};

export interface CompanyResponse {
  company: CompanySQL | null;
};

export interface CompanyUID {
  companyUID: string,
}

export interface CompanyUIDResponse {
  data: CompanyUID,
  error: PostgrestError | null
}