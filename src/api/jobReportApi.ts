import { supabase } from "../config/supabase";
import { JobReport, JobReportSQL } from "../types/JobReport";
import { convertDateToISO } from "../utils/jobReportUitls";
import { PAGE_SIZE } from "./clientsApi";

export const submitJobReportApi = async (jobReportData: JobReport) => {
  const { id, systemId, clientId, jobReport, jobDate } = jobReportData;

  return await supabase
    .from("job_reports")
    .insert<JobReportSQL>([
      {
        id,
        system_id: systemId,
        client_id: clientId,
        job_report: jobReport,
        job_date: jobDate
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
    .order("job_date", { ascending: false });
}

export const fetchCompanyJobReportsApi = async (page: number, companyId: string) => {
  return await supabase
    .from('job_reports')
    .select('*, clients!inner(company_id)')
    .eq('clients.company_id', companyId)
    .order("job_date", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
}

export const filterCompanyJobReportsApi = async (companyId: string, date: string) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfDayISO = convertDateToISO(startOfDay);
  const endOfDayISO = convertDateToISO(endOfDay);

  return await supabase
    .from('job_reports')
    .select('*, clients!inner(company_id)')
    .eq('clients.company_id', companyId)
    .gte('job_date', startOfDayISO)
    .lte('job_date', endOfDayISO)
}

export const fetchJobReportApi = async (jobReportId: string) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("id", jobReportId)
    .order("created_at", { ascending: false })
    .single();
}
