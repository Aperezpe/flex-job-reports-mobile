import { createAction } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";

export const submitJobReport = createAction<JobReport>("SUBMIT_FORM_REPORT");
export const submitJobReportSuccess = createAction<JobReport>("SUBMIT_FORM_REPORT_SUCCESS");
export const submitJobReportFailure = createAction<string>("SUBMIT_FORM_REPORT_FAILURE");
export const resetJobReport = createAction("RESET_FORM_REPORT");