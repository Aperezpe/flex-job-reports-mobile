import { supabase } from "../config/supabase";
import { JOB_REPORTS_PAGE_SIZE } from "../redux/reducers/jobReportReducer";
import { JobReport, JobReportSQL } from "../types/JobReport";
import { TicketInProgress, TicketViewSQL } from "../types/Ticket";
import { convertDateToISO } from "../utils/jobReportUtils";

export const submitJobReportApi = async (jobReportData: JobReport) => {
  const { id, systemId, reportData: jobReport } = jobReportData;

  return await supabase
    .from("job_reports")
    .insert<JobReportSQL>([
      {
        id,
        system_id: systemId,
        job_report: jobReport,
      },
    ])
    .select("*")
    .single();
};

export const submitTicketApi = async (ticketInProgress: TicketInProgress) => {
  const { data: ticketId, error } = await supabase.rpc(
    "submit_ticket_with_job_reports",
    {
      p_address_id: ticketInProgress.address?.id,
      p_ticket_date: ticketInProgress.ticket?.ticketDate,
      p_technician_id: ticketInProgress.ticket?.technicianId,
      p_company_id: ticketInProgress.ticket?.companyId,
      p_job_reports: ticketInProgress.jobReports,
    }
  );

  if (error) throw error;

  return await supabase
    .from("tickets_view")
    .select("*")
    .eq("id", ticketId)
    .single();
};

export const fetchClientTicketsApi = async (clientId: number) => {
  return await supabase
    .from("tickets_view")
    .select("*")
    .eq("client_id", clientId)
    .order("ticket_date", { ascending: false })
    .returns<TicketViewSQL[]>()
};

export const fetchJobReportApi = async (jobReportId: string) => {
  return await supabase
    .from("job_reports")
    .select("*")
    .eq("id", jobReportId)
    .order("created_at", { ascending: false })
    .single();
};

export const fetchJobReportByTicketIdApi = async (ticketId: string) => {
  return await supabase
    .from("job_reports")
    .select("*, system:systems(system_type_id)")
    .eq("ticket_id", ticketId)
    .returns<JobReportSQL[]>();
};

export const fetchCompanyTicketsApi = async (
  page: number,
  companyId: string
) => {
  return await supabase
    .from("tickets_view")
    .select(`*`)
    .eq("company_id", companyId)
    .order("ticket_date", { ascending: false })
    .range(
      (page - 1) * JOB_REPORTS_PAGE_SIZE,
      page * JOB_REPORTS_PAGE_SIZE - 1
    );
};

export const searchCompanyTicketsApi = async ({
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
  let ticketsByClientQuery = supabase
    .from("tickets_view")
    .select("id")
    .eq("company_id", companyId)
    .ilike("client_name", `%${query}%`);

  if (startOfDayISO && endOfDayISO) {
    ticketsByClientQuery = ticketsByClientQuery
      .gte("ticket_date", startOfDayISO)
      .lte("ticket_date", endOfDayISO);
  }

  const { data: ticketsByClient, error: errorByClient } =
    await ticketsByClientQuery;
  if (errorByClient) throw errorByClient;

  // console.log("ticketsByClient", ticketsByClient)

  // Fetch reports matching address
  let ticketsByAddressQuery = supabase
    .from("tickets_view")
    .select("id")
    .eq("company_id", companyId)
    .ilike("address_string", `%${query}%`);

  if (startOfDayISO && endOfDayISO) {
    ticketsByAddressQuery = ticketsByAddressQuery
      .gte("ticket_date", startOfDayISO)
      .lte("ticket_date", endOfDayISO);
  }

  const { data: ticketsByAddress, error: errorByAddress } =
    await ticketsByAddressQuery;
  if (errorByAddress) throw errorByAddress;

  // console.log("ticketsByAddress", ticketsByAddress)

  // Merge IDs from both results
  const combinedTicketIds = new Set([
    ...(ticketsByClient ?? []).map((r) => r.id),
    ...(ticketsByAddress ?? []).map((r) => r.id),
  ]);

  console.log(
    "from page",
    (page - 1) * JOB_REPORTS_PAGE_SIZE,
    "to page",
    page * JOB_REPORTS_PAGE_SIZE - 1
  );

  if (combinedTicketIds.size === 0) return { data: [] };

  // Final paginated fetch by combined IDs
  return await supabase
    .from("tickets_view")
    .select("*")
    .in("id", [...combinedTicketIds])
    .order("ticket_date", { ascending: false })
    .range(
      (page - 1) * JOB_REPORTS_PAGE_SIZE,
      page * JOB_REPORTS_PAGE_SIZE - 1
    );
};
