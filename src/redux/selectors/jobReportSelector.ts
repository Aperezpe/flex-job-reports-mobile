import { JobReport } from "../../types/JobReport";
import { RootState } from "../store";

export const selectJobReport = (state: RootState): JobReport | null => state.jobReport.jobReport;
export const selectJobReportLoading = (state: RootState): boolean => state.jobReport.loading;
export const selectJobReportError = (state: RootState): string | null => state.jobReport.error;
export const selectJobReportsHistory = (state: RootState): JobReport[] | null => state.jobReport.clientJobReportsHistory;
export const selectJobReportHistoryLoading = (state: RootState): boolean => state.jobReport.jobReportHistoryLoading;
export const selectNewJobReportIdentified = (state: RootState): boolean => state.jobReport.newJobReportIdentified;