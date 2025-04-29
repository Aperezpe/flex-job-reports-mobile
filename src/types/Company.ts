import { PostgrestError } from "@supabase/supabase-js";
import { mapSystemType, SystemType, SystemTypeSQL } from "./SystemType";

// TODO: Take care of the "Unexpected any"
export interface Company {
  id?: string;
  companyName?: string;
  systemTypes?: SystemType[];
  adminId?: string;
  companyUID?: string;
  config?: CompanyConfig;
}

export interface CompanySQL {
  id?: string;
  company_name?: string;
  system_types?: SystemTypeSQL[];
  admin_id?: string;
  company_uid?: string;
  config?: CompanyConfig;
}

export const mapCompanySQLToCompany = (sqlData?: CompanySQL): Company => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    companyName: sqlData.company_name,
    adminId: sqlData.admin_id,
    companyUID: sqlData.company_uid,
    systemTypes: sqlData.system_types?.map((system_type) =>
      mapSystemType(system_type)
    ),
    config: sqlData.config,
  };
};

export interface CompanyResponse {
  company: CompanySQL | null;
}

export interface CompanyUID {
  companyUID: string;
}

export interface CompanyUIDResponse {
  data: CompanyUID;
  error: PostgrestError | null;
}

export type JoinCompanyForm = {
  companyUid: string;
};

export interface CompanyConfig {
  jobReportEmailEnabled: boolean;
  jobReportEmail?: string;
  smartEmailSummaryEnabled: boolean;
}

export type CompanyConfigForm = {
  jobReportEmailEnabled: boolean;
  jobReportEmail: string;
  smartSummariesEnabled: boolean;
};
