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
  ticketsLoading: boolean;

  ticketInProgress: TicketInProgress | null;

  loading: boolean;
  error: string | null;
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
  ticketsLoading: false,

  ticketInProgress: null,

  loading: false,
  error: null,
  newTicketIdentified: true,
  jobReportHistoryLoading: false,
};

const jobReportReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(submitTicket, (state) => {
      state.loading = true;
    })
    .addCase(submitTicketSuccess, (state, action) => {
      state.ticket = action.payload;
      state.error = null;
      state.loading = false;
      state.newTicketIdentified = true;
    })
    .addCase(submitTicketFailure, (state, action) => {
      state.ticket = null;
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(resetTicket, (state) => {
      state.ticket = null;
      state.loading = false;
      state.error = null;
    })


    // .addCase(fetchClientJobReportsHistory, (state) => {
    //   state.jobReportHistoryLoading = true;
    //   state.error = null;
    // })
    // .addCase(fetchClientJobReportsHistorySuccess, (state, action) => {
    //   state.clientJobReportsHistory = action.payload;
    //   state.jobReportHistoryLoading = false;
    //   state.error = null;
    //   state.newJobReportIdentified = false;
    // })
    // .addCase(fetchClientJobReportsHistoryFailure, (state, action) => {
    //   state.clientJobReportsHistory = null;
    //   state.jobReportHistoryLoading = false;
    //   state.error = action.payload;
    // })
    .addCase(resetCompanyTickets, (state) => {
      state.companyTickets = null;
      state.ticketsPage = 1;
      state.ticketsHasMore = true;
      state.ticketsLoading = false;
      state.error = null;
    })
    .addCase(fetchCompanyTickets, (state) => {
      state.ticketsLoading = true;
      state.error = null;
    })
    .addCase(fetchCompanyTicketsSuccess, (state, action) => {
      state.companyTickets = [...(state.companyTickets ?? []), ...action.payload];
      state.ticketsLoading = false;
      state.error = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.ticketsHasMore = false;
      state.ticketsPage += 1;
    })
    .addCase(fetchCompanyTicketsFailure, (state, action) => {
      state.ticketsLoading = false;
      state.error = action.payload;
    })
    
    .addCase(fetchJobReport, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchJobReportSuccess, (state, action) => {
      state.jobReport = action.payload;
      state.loading = false;
      state.error = null;
    })
    .addCase(fetchJobReportFailure, (state, action) => {
      state.jobReport = null;
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(resetSearchCompanyTickets, (state) => {
      state.searchedCompanyTickets = [];
      state.searchedCompanyTicketsPage = 1;
      state.searchedCompanyTicketsHasMore = true;
    })
    .addCase(searchCompanyTickets, (state) => {
      state.ticketsLoading = true;
      state.error = null;
    })
    .addCase(searchCompanyTicketsSuccess, (state, action) => {
      state.searchedCompanyTickets = [...(state.searchedCompanyTickets ?? []), ...action.payload];
      state.ticketsLoading = false;
      state.error = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.searchedCompanyTicketsHasMore = false;
      state.searchedCompanyTicketsPage += 1;
    })
    .addCase(searchCompanyTicketsFailure, (state, action) => {
      state.ticketsLoading = false;
      state.error = action.payload;
    })
    .addCase(searchCompanyTicketsFromLocalResults, (state, action) => {
      state.searchedCompanyTickets = action.payload;
      state.ticketsLoading = false;
      state.error = null;
    })
    .addCase(updateTicketInProgress, (state, action) => {
      state.ticketInProgress = action.payload;
    })
    .addCase(resetTicketInProgress, (state) => {
      state.ticketInProgress = null;
    })
});

export default jobReportReducer;
