import { createReducer } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";
import {
  resetJobReport,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";

interface JobReportState {
  jobReport: JobReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobReportState = {
  jobReport: null,
  loading: false,
  error: null,
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
    });
});

export default jobReportReducer;
