import { supabase } from "../config/supabase";
import { JobReport, JobReportSQL } from "../types/JobReport";
import { PAGE_SIZE } from "./clientsApi";

export const submitJobReportApi = async (jobReportData: JobReport) => {
  const { id, systemId, clientId, jobReport } = jobReportData;

  return await supabase
    .from("job_reports")
    .insert<JobReportSQL>([
      {
        id,
        system_id: systemId,
        client_id: clientId,
        job_report: jobReport,
      },
    ])
    .select("*")
    .single();
};

export const fetchClientJobReportsApi = async (clientId: number) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
}

export const fetchCompanyJobReportsApi = async (page: number, companyId: string) => {
  return await supabase
    .from('job_reports')
    .select('*, clients!inner(company_id)')
    .eq('clients.company_id', companyId)
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
}

export const fetchJobReportApi = async (jobReportId: string) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("id", jobReportId)
    .order("created_at", { ascending: false })
    .single();
}
