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
  filterCompanyJobReportHistory,
  filterCompanyJobReportHistoryFailure,
  filterCompanyJobReportHistorySuccess,
  resetCompanyJobReportsHistory,
  resetJobReport,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";
import { PAGE_SIZE } from "../../api/clientsApi";

interface JobReportState {
  jobReport: JobReport | null;
  clientJobReportsHistory: JobReport[] | null;
  companyJobReportsHistory: JobReport[] | null;
  filteredCompanyJobReportsHistory: JobReport[] | null;
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
      if (action.payload.length < PAGE_SIZE) state.hasMore = false;
      state.page += 1;
    })
    .addCase(fetchCompanyJobReportsHistoryFailure, (state, action) => {
      state.jobReportHistoryLoading = false;
      state.error = action.payload;
    })
    .addCase(filterCompanyJobReportHistory, (state) => {
      state.jobReportHistoryLoading = true;
      state.error = null;
    })
    .addCase(filterCompanyJobReportHistorySuccess, (state, action) => {
      state.filteredCompanyJobReportsHistory = action.payload;
      state.jobReportHistoryLoading = false;
      state.error = null;
    })
    .addCase(filterCompanyJobReportHistoryFailure, (state, action) => {
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
});

export default jobReportReducer;
