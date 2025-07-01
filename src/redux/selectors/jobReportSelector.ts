import { JobReport } from "../../types/JobReport";
import { TicketView } from "../../types/Ticket";
import { RootState } from "../store";

export const selectJobReport = (state: RootState): JobReport | null => state.jobReport.jobReport;
export const selectJobReportLoading = (state: RootState): boolean => state.jobReport.loading;
export const selectJobReportError = (state: RootState): string | null => state.jobReport.error;
export const selectJobReportsHistory = (state: RootState): JobReport[] | null => state.jobReport.clientJobReportsHistory;
export const selectJobReportHistoryLoading = (state: RootState): boolean => state.jobReport.jobReportHistoryLoading;

export const selectCompanyTickets = (state: RootState): TicketView[] | null => state.jobReport.companyTickets;
export const selectTicketsPage = (state: RootState): number => state.jobReport.ticketsPage;
export const selectTicketsHasMore = (state: RootState): boolean => state.jobReport.ticketsHasMore;
export const selectTicketsLoading = (state: RootState): boolean => state.jobReport.ticketsLoading;

export const selectSearchedTickets = (state: RootState): TicketView[] | null => state.jobReport.searchedCompanyTickets;
export const selectSearchedTicketsPage = (state: RootState): number | null => state.jobReport.searchedCompanyTicketsPage;
export const selectSearchedTicketsHasMore = (state: RootState): boolean => state.jobReport.searchedCompanyTicketsHasMore;

export const selectNewJobReportIdentified = (state: RootState): boolean => state.jobReport.newJobReportIdentified;