import { JobReport } from "../../types/JobReport";
import { TicketData, TicketView } from "../../types/Ticket";
import { RootState } from "../store";

export const selectJobReport = (state: RootState): JobReport | null => state.jobReport.jobReport;
export const selectJobReportLoading = (state: RootState): boolean | null => state.jobReport.jobReportLoading;
export const selectJobReportError = (state: RootState): string | null => state.jobReport.jobReportError;


export const selectClientTickets = (state: RootState): TicketView[] | null => state.jobReport.clientTickets;

export const selectCompanyTickets = (state: RootState): TicketView[] | null => state.jobReport.companyTickets;
export const selectTicket = (state: RootState): TicketView | null => state.jobReport.ticket;
export const selectTicketsLoading = (state: RootState): boolean => state.jobReport.ticketsLoading;
export const selectTicketsPage = (state: RootState): number => state.jobReport.ticketsPage;
export const selectTicketsHasMore = (state: RootState): boolean => state.jobReport.ticketsHasMore;
export const selectTicketError = (state: RootState): string | null => state.jobReport.ticketsError;

export const selectSearchedTickets = (state: RootState): TicketView[] | null => state.jobReport.searchedCompanyTickets;
export const selectSearchedTicketsPage = (state: RootState): number | null => state.jobReport.searchedCompanyTicketsPage;
export const selectSearchedTicketsHasMore = (state: RootState): boolean => state.jobReport.searchedCompanyTicketsHasMore;

export const selectNewTicketIdentified = (state: RootState): boolean => state.jobReport.newTicketIdentified;
export const selectTicketInProgress = (state: RootState): TicketData | null => state.jobReport.ticketInProgress;