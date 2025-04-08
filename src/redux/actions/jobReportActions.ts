import { createAction } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";

export const submitJobReport = createAction<JobReport>("SUBMIT_FORM_REPORT");
export const submitJobReportSuccess = createAction<JobReport>(
  "SUBMIT_FORM_REPORT_SUCCESS"
);
export const submitJobReportFailure = createAction<string>(
  "SUBMIT_FORM_REPORT_FAILURE"
);
export const resetJobReport = createAction("RESET_FORM_REPORT");

export const fetchClientJobReportsHistory = createAction<{
  clientId: number;
}>("FETCH_JOB_REPORTS_HISTORY");

export const fetchClientJobReportsHistorySuccess = createAction<JobReport[]>(
  "FETCH_JOB_REPORTS_HISTORY_SUCCESS"
);
export const fetchClientJobReportsHistoryFailure = createAction<string>(
  "FETCH_JOB_REPORTS_HISTORY_FAILURE"
);
