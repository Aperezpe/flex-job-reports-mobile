import { supabase } from "../config/supabase";
import { JobReport, JobReportSQL } from "../types/JobReport";

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

export const fetchClientJobReportApi = async (clientId: number) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
}
