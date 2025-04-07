import { RootState } from "../store";

export const selectjobReportLoading = (state: RootState): boolean | null => state.jobReport.loading;
export const selectjobReportError = (state: RootState): string | null => state.jobReport.error;
