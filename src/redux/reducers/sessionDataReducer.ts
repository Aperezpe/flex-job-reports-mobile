import { createReducer } from "@reduxjs/toolkit";
import { Company } from "../../types/Company";
import { AppUser } from "../../types/Auth/AppUser";
import {
  clearCompanyAndUser,
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
  setLoadingCompanyAndUser,
} from "../actions/sessionDataActions";

interface CompanyAndUserState {
  appCompany: Company | null;
  appUser: AppUser | null;
  loadingCompanyAndUser: boolean;
  error: string | null;
}

const initialState: CompanyAndUserState = {
  appCompany: null,
  appUser: null,
  loadingCompanyAndUser: false,
  error: null,
};

const companyAndUserReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchCompanyAndUser, (state) => {
      state.loadingCompanyAndUser = true;
    })
    .addCase(fetchCompanyAndUserSuccess, (state, action) => {
      state.appCompany = action.payload.company;
      state.appUser = action.payload.user;
      state.loadingCompanyAndUser = false;
      state.error = null;
    })
    .addCase(fetchCompanyAndUserFailure, (state, action) => {
      state.loadingCompanyAndUser = false;
      state.error = action.payload;
    })
    .addCase(clearCompanyAndUser, (state) => {
      state.appCompany = null;
      state.appUser = null;
    })
    .addCase(setLoadingCompanyAndUser, (state, action) => {
      state.loadingCompanyAndUser = action.payload;
    });
});

export default companyAndUserReducer;
