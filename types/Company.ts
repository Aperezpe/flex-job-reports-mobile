import { PostgrestError } from "@supabase/supabase-js"

export interface Company {
  id: string,
  companyName: string,
  companyPhone: string,
  companyAddress: string,
  systemTypes?: string[],
  adminId: string,
  forms?: any
  companyUID: string,
}

export interface CompanySQL {
  id?: string,
  company_name?: string,
  company_address?: string,
  phone_number?: string,
  system_types?: string[],
  admin_id?: string,
  forms?: any
  company_uid?: string,
}

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