import { JobReport } from "../../types/JobReport";
import { RootState } from "../store";

export const selectJobReport = (state: RootState): JobReport | null => state.jobReport.jobReport;
export const selectJobReportLoading = (state: RootState): boolean | null => state.jobReport.loading;
export const selectJobReportError = (state: RootState): string | null => state.jobReport.error;