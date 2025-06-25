import { createReducer } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";
import {
  fetchClientJobReportsHistory,
  fetchClientJobReportsHistoryFailure,
  fetchClientJobReportsHistorySuccess,
  fetchCompanyJobReportsHistory,
  fetchCompanyJobReportsHistoryFailure,
  fetchCompanyJobReportsHistorySuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  resetCompanyJobReportsHistory,
  resetJobReport,
  resetSearchCompanyJobReports,
  searchCompanyJobReports,
  searchCompanyJobReportsFailure,
  searchCompanyJobReportsFromLocalResults,
  searchCompanyJobReportsSuccess,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";

export const JOB_REPORTS_PAGE_SIZE = 20;

interface JobReportState {
  jobReport: JobReport | null;
  clientJobReportsHistory: JobReport[] | null;
  companyJobReportsHistory: JobReport[] | null;
  filteredCompanyJobReportsHistory: JobReport[] | null;
  searchedJobReportsHistory: JobReport[] | null;
  searchedJobReportsPage: number;
  searchedJobReportsHasMore: boolean;
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  newJobReportIdentified: boolean;
  jobReportHistoryLoading: boolean;
}

const initialState: JobReportState = {
  jobReport: null,
  clientJobReportsHistory: null,
  companyJobReportsHistory: null,
  filteredCompanyJobReportsHistory: null,
  searchedJobReportsHistory: null,
  searchedJobReportsPage: 1,
  searchedJobReportsHasMore: true,
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
  newJobReportIdentified: true,
  jobReportHistoryLoading: false,
};

const jobReportReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(submitJobReport, (state) => {
      state.loading = true;
    })
    .addCase(submitJobReportSuccess, (state, action) => {
      state.jobReport = action.payload;
      state.error = null;
      state.loading = false;
      state.newJobReportIdentified = true;
    })
    .addCase(submitJobReportFailure, (state, action) => {
      state.jobReport = null;
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(resetJobReport, (state) => {
      state.jobReport = null;
      state.loading = false;
      state.error = null;
    })
    .addCase(fetchClientJobReportsHistory, (state) => {
      state.jobReportHistoryLoading = true;
      state.error = null;
    })
    .addCase(fetchClientJobReportsHistorySuccess, (state, action) => {
      state.clientJobReportsHistory = action.payload;
      state.jobReportHistoryLoading = false;
      state.error = null;
      state.newJobReportIdentified = false;
    })
    .addCase(fetchClientJobReportsHistoryFailure, (state, action) => {
      state.clientJobReportsHistory = null;
      state.jobReportHistoryLoading = false;
      state.error = action.payload;
    })
    .addCase(resetCompanyJobReportsHistory, (state) => {
      state.companyJobReportsHistory = null;
      state.page = 1;
      state.hasMore = true;
      state.jobReportHistoryLoading = false;
      state.error = null;
    })
    .addCase(fetchCompanyJobReportsHistory, (state) => {
      state.jobReportHistoryLoading = true;
      state.error = null;
    })
    .addCase(fetchCompanyJobReportsHistorySuccess, (state, action) => {
      state.companyJobReportsHistory = [...(state.companyJobReportsHistory ?? []), ...action.payload];
      state.jobReportHistoryLoading = false;
      state.error = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.hasMore = false;
      state.page += 1;
    })
    .addCase(fetchCompanyJobReportsHistoryFailure, (state, action) => {
      state.jobReportHistoryLoading = false;
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
    .addCase(searchCompanyJobReports, (state) => {
      state.jobReportHistoryLoading = true;
      state.error = null;
    })
    .addCase(searchCompanyJobReportsSuccess, (state, action) => {
      state.searchedJobReportsHistory = [...(state.searchedJobReportsHistory ?? []), ...action.payload];
      state.jobReportHistoryLoading = false;
      state.error = null;
      if (action.payload.length < JOB_REPORTS_PAGE_SIZE) state.searchedJobReportsHasMore = false;
      state.searchedJobReportsPage += 1;
    })
    .addCase(searchCompanyJobReportsFailure, (state, action) => {
      state.jobReportHistoryLoading = false;
      state.error = action.payload;
    })
    .addCase(resetSearchCompanyJobReports, (state) => {
      state.searchedJobReportsHistory = [];
      state.searchedJobReportsPage = 1;
      state.searchedJobReportsHasMore = true;
    })
    .addCase(searchCompanyJobReportsFromLocalResults, (state, action) => {
      state.searchedJobReportsHistory = action.payload;
      state.jobReportHistoryLoading = false;
      state.error = null;
    })
});

export default jobReportReducer;
