import { supabase } from "../config/supabase";
import { JOB_REPORTS_PAGE_SIZE } from "../redux/reducers/jobReportReducer";
import { JobReport, JobReportSQL } from "../types/JobReport";
import { convertDateToISO } from "../utils/jobReportUtils";

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
    .from("job_reports_view")
    .select("*")
    .eq("company_id", companyId)
    .order("job_date", { ascending: false })
    .range((page - 1) * JOB_REPORTS_PAGE_SIZE, page * JOB_REPORTS_PAGE_SIZE - 1);
};

export const fetchJobReportApi = async (jobReportId: string) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("id", jobReportId)
    .order("created_at", { ascending: false })
    .single();
}

export const searchCompanyJobReportsApi = async ({
  companyId,
  query = "",
  date,
  page = 1,
}: {
  companyId: string;
  query?: string;
  date?: string;
  page: number;
}) => {
  // Prepare optional date filters
  let startOfDayISO: string | undefined;
  let endOfDayISO: string | undefined;

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    startOfDayISO = convertDateToISO(startOfDay);
    endOfDayISO = convertDateToISO(endOfDay);
  }

  // Fetch reports matching client name
  let reportsByClientQuery = supabase
    .from("job_reports_view")
    .select("id")
    .eq("company_id", companyId)
    .ilike("client_name", `%${query}%`);

  if (startOfDayISO && endOfDayISO) {
    reportsByClientQuery = reportsByClientQuery
      .gte("job_date", startOfDayISO)
      .lte("job_date", endOfDayISO);
  }

  const { data: reportsByClient, error: errorByClient } = await reportsByClientQuery;
  if (errorByClient) throw errorByClient;

  // Fetch reports matching address
  let reportsByAddressQuery = supabase
    .from("job_reports_view")
    .select("id")
    .eq("company_id", companyId)
    .ilike("address", `%${query}%`);

  if (startOfDayISO && endOfDayISO) {
    reportsByAddressQuery = reportsByAddressQuery
      .gte("job_date", startOfDayISO)
      .lte("job_date", endOfDayISO);
  }

  const { data: reportsByAddress, error: errorByAddress } = await reportsByAddressQuery;
  if (errorByAddress) throw errorByAddress;

  // Merge IDs from both results
  const combinedReportIds = new Set([
    ...(reportsByClient ?? []).map((r) => r.id),
    ...(reportsByAddress ?? []).map((r) => r.id),
  ]);

  if (combinedReportIds.size === 0) return { data: [] };

  // Final paginated fetch by combined IDs
  return await supabase
    .from("job_reports_view")
    .select("*")
    .in("id", [...combinedReportIds])
    .order("job_date", { ascending: false })
    .range((page - 1) * JOB_REPORTS_PAGE_SIZE, page * JOB_REPORTS_PAGE_SIZE - 1);
};