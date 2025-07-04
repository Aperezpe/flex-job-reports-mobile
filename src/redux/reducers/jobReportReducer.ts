import { createReducer } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";
import {
  fetchCompanyTickets,
  fetchCompanyTicketsFailure,
  fetchCompanyTicketsSuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  resetCompanyTickets,
  resetTicketInProgress,
  resetSearchCompanyTickets,
  updateTicketInProgress,
  searchCompanyTickets,
  searchCompanyTicketsFailure,
  searchCompanyTicketsFromLocalResults,
  searchCompanyTicketsSuccess,
  submitTicket,
  submitTicketSuccess,
  submitTicketFailure,
  resetTicket,
  fetchClientTickets,
  fetchClientTicketsSuccess,
  fetchClientTicketsFailure,
} from "../actions/jobReportActions";
import { TicketInProgress, TicketView } from "../../types/Ticket";

export const JOB_REPORTS_PAGE_SIZE = 20;

interface JobReportState {
  ticket: TicketView | null;
  jobReport: JobReport | null;
  clientJobReportsHistory: JobReport[] | null;
  companyJobReportsHistory: JobReport[] | null;
  filteredCompanyJobReportsHistory: JobReport[] | null;
  page: number;
  hasMore: boolean;

  searchedCompanyTickets: TicketView[] | null;
  searchedCompanyTicketsPage: number;
  searchedCompanyTicketsHasMore: boolean;

  companyTickets: TicketView[] | null;
  ticketsPage: number;
  ticketsHasMore: boolean;

  clientTickets: TicketView[] | null;
  clientTicketsPage: number;
  clientTicketsHasMore: boolean;

  ticketsLoading: boolean;
  ticketsError: string | null;

  ticketInProgress: TicketInProgress | null;

  jobReportLoading: boolean;
  jobReportError: string | null;
  newTicketIdentified: boolean;
  jobReportHistoryLoading: boolean;
}

const initialState: JobReportState = {
  ticket: null,
  jobReport: null,
  clientJobReportsHistory: null,
  companyJobReportsHistory: null,
  filteredCompanyJobReportsHistory: null,
  page: 1,
  hasMore: true,

  searchedCompanyTickets: null,
  searchedCompanyTicketsPage: 1,
  searchedCompanyTicketsHasMore: true,

  companyTickets: null,
  ticketsPage: 1,
  ticketsHasMore: true,

  clientTickets: null,
  clientTicketsPage: 1,
  clientTicketsHasMore: true,

  ticketsLoading: false,
  ticketsError: null,

  ticketInProgress: null,

  jobReportLoading: false,
  jobReportError: null,
  newTicketIdentified: true,
  jobReportHistoryLoading: false,
};

const jobReportReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(submitTicket, (state) => {
      state.ticketsLoading = true;
    })
    .addCase(submitTicketSuccess, (state, action) => {
      state.ticket = action.payload;
      state.ticketsError = null;
      state.ticketsLoading = false;
      state.newTicketIdentified = true;
    })
    .addCase(submitTicketFailure, (state, action) => {
      state.ticket = null;
      state.ticketsError = action.payload;
      state.ticketsLoading = false;
    })
    .addCase(resetTicket, (state) => {
      state.ticket = null;
      state.ticketsLoading = false;
      state.ticketsError = null;
    })


    .addCase(fetchClientTickets, (state) => {
      state.ticketsLoading = true;
      state.clientTickets = null;
    })
    .addCase(fetchClientTicketsSuccess, (state, action) => {
      state.clientTickets = action.payload;
      state.ticketsLoading = false;
      state.ticketsError = null;
      state.newTicketIdentified = false;
    })
    .addCase(fetchClientTicketsFailure, (state, action) => {
      state.clientTickets = null;
      state.ticketsLoading = false;
      state.ticketsError = action.payload;
    })

    
    .addCase(resetCompanyTickets, (state) => {
      state.companyTickets = null;
      state.ticketsPage = 1;
      state.ticketsHasMore = true;
      state.ticketsLoading = false;
      state.ticketsError = null;
    })
    .addCase(fetchCompanyTickets, (state) => {
      state.ticketsLoading = true;
      state.ticketsError = null;
    })
    .addCase(fetchCompanyTicketsSuccess, (state, action) => {
      state.companyTickets = [...(state.companyTickets ?? []), ...action.payload];
      state.ticketsLoading = false;
      state.ticketsError = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.ticketsHasMore = false;
      state.ticketsPage += 1;
    })
    .addCase(fetchCompanyTicketsFailure, (state, action) => {
      state.ticketsLoading = false;
      state.ticketsError = action.payload;
    })

    .addCase(fetchJobReport, (state) => {
      state.jobReportLoading = true;
      state.jobReportError = null;
    })
    .addCase(fetchJobReportSuccess, (state, action) => {
      state.jobReport = action.payload;
      state.jobReportLoading = false;
      state.jobReportError = null;
    })
    .addCase(fetchJobReportFailure, (state, action) => {
      state.jobReport = null;
      state.jobReportLoading = false;
      state.jobReportError = action.payload;
    })
    .addCase(resetSearchCompanyTickets, (state) => {
      state.searchedCompanyTickets = [];
      state.searchedCompanyTicketsPage = 1;
      state.searchedCompanyTicketsHasMore = true;
    })
    .addCase(searchCompanyTickets, (state) => {
      state.ticketsLoading = true;
      state.ticketsError = null;
    })
    .addCase(searchCompanyTicketsSuccess, (state, action) => {
      state.searchedCompanyTickets = [...(state.searchedCompanyTickets ?? []), ...action.payload];
      state.ticketsLoading = false;
      state.ticketsError = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.searchedCompanyTicketsHasMore = false;
      state.searchedCompanyTicketsPage += 1;
    })
    .addCase(searchCompanyTicketsFailure, (state, action) => {
      state.ticketsLoading = false;
      state.ticketsError = action.payload;
    })
    .addCase(searchCompanyTicketsFromLocalResults, (state, action) => {
      state.searchedCompanyTickets = action.payload;
      state.ticketsLoading = false;
      state.ticketsError = null;
    })
    .addCase(updateTicketInProgress, (state, action) => {
      state.ticketInProgress = action.payload;
    })
    .addCase(resetTicketInProgress, (state) => {
      state.ticketInProgress = null;
    })
});

export default jobReportReducer;
