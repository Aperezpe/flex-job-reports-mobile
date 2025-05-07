import { createReducer } from "@reduxjs/toolkit";
import {
  fetchCompanyTechnicians,
  fetchCompanyTechniciansFailure,
  fetchCompanyTechniciansSuccess,
} from "../actions/techniciansActions";
import { AppUser } from "../../types/Auth/AppUser";

interface TechniciansState {
  technicians: AppUser[];
  techniciansLoading: boolean;
  error: string | null;
}

const initialState: TechniciansState = {
  technicians: [],
  techniciansLoading: false,
  error: null,
};

const techniciansReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchCompanyTechnicians, (state) => {
      state.techniciansLoading = true;
    })
    .addCase(fetchCompanyTechniciansSuccess, (state, action) => {
      state.technicians = action.payload;
      state.techniciansLoading = false;
    })
    .addCase(fetchCompanyTechniciansFailure, (state, action) => {
      state.error = action.payload;
      state.techniciansLoading = false;
    })
});

export default techniciansReducer;
