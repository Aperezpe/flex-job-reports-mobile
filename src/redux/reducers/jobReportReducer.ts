import { createReducer } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";
import {
  fetchClientJobReportsHistory,
  fetchClientJobReportsHistoryFailure,
  fetchClientJobReportsHistorySuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  resetJobReport,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";

interface JobReportState {
  jobReport: JobReport | null;
  clientJobReportsHistory: JobReport[] | null;
  loading: boolean;
  error: string | null;
  newJobReportIdentified: boolean;
  jobReportHistoryLoading: boolean;
}

const initialState: JobReportState = {
  jobReport: null,
  clientJobReportsHistory: null,
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
