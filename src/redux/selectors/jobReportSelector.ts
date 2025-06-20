import { JobReport } from "../../types/JobReport";
import { RootState } from "../store";

export const selectJobReport = (state: RootState): JobReport | null => state.jobReport.jobReport;
export const selectJobReportLoading = (state: RootState): boolean => state.jobReport.loading;
export const selectJobReportError = (state: RootState): string | null => state.jobReport.error;
export const selectJobReportsHistory = (state: RootState): JobReport[] | null => state.jobReport.clientJobReportsHistory;
export const selectJobReportHistoryLoading = (state: RootState): boolean => state.jobReport.jobReportHistoryLoading;
export const selectCompanyJobReportsHistory = (state: RootState): JobReport[] | null => state.jobReport.companyJobReportsHistory;
export const selectJobReportsPage = (state: RootState): number => state.jobReport.page;
export const selectJobReportsHasMore = (state: RootState): boolean => state.jobReport.hasMore;
export const selectNewJobReportIdentified = (state: RootState): boolean => state.jobReport.newJobReportIdentified;
export const selectFilteredJobReportsHistory = (state: RootState): JobReport[] | null => state.jobReport.filteredCompanyJobReportsHistory;