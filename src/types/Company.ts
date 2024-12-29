import { PostgrestError } from "@supabase/supabase-js"

export interface Company {
  id?: string,
  companyName?: string,
  systemTypes?: string[],
  adminId?: string,
  forms?: any
  companyUID?: string,
}

export interface CompanySQL {
  id?: string,
  company_name?: string,
  system_types?: string[],
  admin_id?: string,
  forms?: any
  company_uid?: string,
}

export const mapCompanySQLToCompany = (sqlData: CompanySQL): Company => {
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