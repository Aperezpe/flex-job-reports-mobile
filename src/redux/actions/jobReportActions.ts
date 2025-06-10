import { createAction } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";

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

export const filterCompanyJobReportHistory = createAction<{
  companyId: string;
  date: string;
}>("FILTER_COMPANY_JOB_REPORT_HISTORY");
export const filterCompanyJobReportHistorySuccess = createAction<JobReport[]>(
  "FILTER_COMPANY_JOB_REPORT_HISTORY_SUCCESS"
);
export const filterCompanyJobReportHistoryFailure = createAction<string>(
  "FILTER_COMPANY_JOB_REPORT_HISTORY_FAILURE"
);

export const fetchJobReport = createAction<string>("FETCH_JOB_REPORT");
export const fetchJobReportSuccess = createAction<JobReport>(
  "FETCH_JOB_REPORT_SUCCESS"
);
export const fetchJobReportFailure = createAction<string>(
  "FETCH_JOB_REPORT_FAILURE"
);

export const resetJobReport = createAction("RESET_FORM_REPORT");