import { createReducer } from "@reduxjs/toolkit";
import { JobReport } from "../../types/JobReport";
import { submitJobReport, submitJobReportFailure, submitJobReportSuccess } from "../actions/jobReportActions";

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
    .addCase(submitJobReportSuccess, (state) => {
      state.loading = false;
    })
    .addCase(submitJobReportFailure, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    })

});

export default jobReportReducer;
