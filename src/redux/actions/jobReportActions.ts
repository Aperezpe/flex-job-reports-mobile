import { createAction } from "@reduxjs/toolkit";
import { JobReport, JobReportView } from "../../types/JobReport";

export const submitJobReport = createAction<JobReport>("SUBMIT_FORM_REPORT");
export const submitJobReportSuccess = createAction<JobReport>(
  "SUBMIT_FORM_REPORT_SUCCESS"
);
export const submitJobReportFailure = createAction<string>(
  "SUBMIT_FORM_REPORT_FAILURE"
);

export const fetchClientJobReportsHistory = createAction<{
  clientId: number;
}>("FETCH_JOB_REPORTS_HISTORY");

export const fetchClientJobReportsHistorySuccess = createAction<JobReport[]>(
  "FETCH_JOB_REPORTS_HISTORY_SUCCESS"
);
export const fetchClientJobReportsHistoryFailure = createAction<string>(
  "FETCH_JOB_REPORTS_HISTORY_FAILURE"
);

export const resetCompanyJobReportsHistory = createAction("RESET_COMPANY_JOB_REPORTS_HISTORY");
export const fetchCompanyJobReportsHistory = createAction<{ companyId: string }>("FETCH_COMPANY_JOB_REPORTS_HISTORY");
export const fetchCompanyJobReportsHistorySuccess = createAction<JobReport[]>(
  "FETCH_COMPANY_JOB_REPORTS_HISTORY_SUCCESS"
);
export const fetchCompanyJobReportsHistoryFailure = createAction<string>(
  "FETCH_COMPANY_JOB_REPORTS_HISTORY_FAILURE"
);

export const fetchJobReport = createAction<string>("FETCH_JOB_REPORT");
export const fetchJobReportSuccess = createAction<JobReportView>(
  "FETCH_JOB_REPORT_SUCCESS"
);
export const fetchJobReportFailure = createAction<string>(
  "FETCH_JOB_REPORT_FAILURE"
);

export const resetJobReport = createAction("RESET_FORM_REPORT");

export const searchCompanyJobReports = createAction<{ companyId: string, query?: string, date?: string }>("SEARCH_COMPANY_JOB_REPORTS");
export const searchCompanyJobReportsSuccess = createAction<JobReportView[]>("SEARCH_COMPANY_JOB_REPORTS_SUCCESS");
export const searchCompanyJobReportsFailure = createAction<string>("SEARCH_COMPANY_JOB_REPORTS_FAILURE");
export const resetSearchCompanyJobReports = createAction("RESET_SEARCH_COMPANY_JOB_REPORTS")

export const searchCompanyJobReportsFromLocalResults = createAction<JobReportView[]>("SEARCH_COMPANY_JOB_REPORTS_FROM_LOCAL_RESULTS");