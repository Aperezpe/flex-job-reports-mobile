import { createAction } from "@reduxjs/toolkit";
import { JobReport, JobReportView } from "../../types/JobReport";
import { TicketData, TicketView } from "../../types/Ticket";

export const submitJobReport = createAction<JobReport>("SUBMIT_FORM_REPORT");
export const submitJobReportSuccess = createAction<JobReport>(
  "SUBMIT_FORM_REPORT_SUCCESS"
);
export const submitJobReportFailure = createAction<string>(
  "SUBMIT_FORM_REPORT_FAILURE"
);

export const fetchClientTickets = createAction<{
  clientId: number;
}>("FETCH_CLIENT_TICKETS");

export const fetchClientTicketsSuccess = createAction<TicketView[]>(
  "FETCH_CLIENT_TICKETS_SUCCESS"
);
export const fetchClientTicketsFailure = createAction<string>(
  "FETCH_CLIENT_TICKETS_FAILURE"
);

export const resetCompanyTickets = createAction("RESET_COMPANY_TICKETS");
export const fetchCompanyTickets = createAction<{ companyId: string }>("FETCH_COMPANY_TICKETS");
export const fetchCompanyTicketsSuccess = createAction<TicketView[]>(
  "FETCH_COMPANY_TICKETS_SUCCESS"
);
export const fetchCompanyTicketsFailure = createAction<string>(
  "FETCH_COMPANY_TICKETS_FAILURE"
);

export const fetchJobReport = createAction<string>("FETCH_JOB_REPORT");
export const fetchJobReportSuccess = createAction<JobReportView>(
  "FETCH_JOB_REPORT_SUCCESS"
);
export const fetchJobReportFailure = createAction<string>(
  "FETCH_JOB_REPORT_FAILURE"
);

export const resetTicket = createAction("RESET_TICKET");

export const searchCompanyTickets = createAction<{ companyId: string, query?: string, date?: string }>("SEARCH_COMPANY_TICKETS");
export const searchCompanyTicketsSuccess = createAction<JobReportView[]>("SEARCH_COMPANY_TICKETS_SUCCESS");
export const searchCompanyTicketsFailure = createAction<string>("SEARCH_COMPANY_TICKETS_FAILURE");
export const resetSearchCompanyTickets = createAction("RESET_SEARCH_COMPANY_TICKETS")

export const searchCompanyTicketsFromLocalResults = createAction<JobReportView[]>("SEARCH_COMPANY_TICKETS_FROM_LOCAL_RESULTS");

export const updateTicketInProgress = createAction<TicketData>("UPDATE_TICKET_IN_PROGRESS");
export const resetTicketInProgress = createAction("RESET_TICKET_IN_PROGRESS");

export const submitTicket = createAction<TicketData>("SUBMIT_TICKET");
export const submitTicketSuccess = createAction<TicketView>("SUBMIT_TICKET_SUCCESS");
export const submitTicketFailure = createAction<string>("SUBMIT_TICKET_FALURE");
