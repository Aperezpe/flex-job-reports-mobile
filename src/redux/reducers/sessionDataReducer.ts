import { createReducer } from "@reduxjs/toolkit";
import { Company } from "../../types/Company";
import { AppUser } from "../../types/Auth/AppUser";
import {
  hideSystemTypeFailure,
  hideSystemTypeSuccess,
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
  upsertSystemTypeFailure,
  upsertSystemTypeSuccess,
  leaveCompany,
  leaveCompanySuccess,
  leaveCompanyFailure,
  setCompanyConfig,
  setCompanyConfigSuccess,
  setCompanyConfigFailure,
} from "../actions/sessionDataActions";
import { SystemType } from "../../types/SystemType";

interface CompanyAndUserState {
  appCompany: Company | null;
  appUser: AppUser | null;
  systemTypes: SystemType[];
  loading: {
    appCompanyAndUser: boolean;
  };
  error: {
    appCompanyAndUser: string | null;
    systemTypes: string | null;
  };
}

const initialState: CompanyAndUserState = {
  appCompany: null,
  appUser: null,
  systemTypes: [],
  loading: {
    appCompanyAndUser: false,
  },
  error: {
    appCompanyAndUser: null,
    systemTypes: null,
  },
};

const companyAndUserReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchCompanyAndUser, (state) => {
      state.loading.appCompanyAndUser = true;
    })
    .addCase(fetchCompanyAndUserSuccess, (state, action) => {
      state.appCompany = action.payload.company;
      state.appUser = action.payload.user;
      state.systemTypes = action.payload.systemTypes;

      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = null;
    })
    .addCase(fetchCompanyAndUserFailure, (state, action) => {
      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = action.payload;
    })
    .addCase(upsertSystemTypeSuccess, (state, action) => {
      const updatedSystemTypes = state.systemTypes?.map((systemType) => {
        if (systemType.id === action.payload.id) {
          return { ...action.payload };
        }
        return systemType;
      });

      if (
        !updatedSystemTypes.some(
          (systemType) => systemType.id === action.payload.id
        )
      ) {
        updatedSystemTypes.push(action.payload);
      }

      state.systemTypes = updatedSystemTypes;
    })
    .addCase(upsertSystemTypeFailure, (state, action) => {
      state.error.systemTypes = action.payload;
    })
    .addCase(hideSystemTypeSuccess, (state, action) => {
      state.systemTypes = state.systemTypes.filter(
        (systemType) => systemType.id !== action.payload
      );
    })
    .addCase(hideSystemTypeFailure, (state, action) => {
      state.error.systemTypes = action.payload;
    })
    .addCase(leaveCompany, (state) => {
      state.loading.appCompanyAndUser = true;
    })
    .addCase(leaveCompanySuccess, (state, action) => {
      state.appCompany = null;
      state.appUser = action.payload;
      state.systemTypes = [];
      state.loading.appCompanyAndUser = false;
    })
    .addCase(leaveCompanyFailure, (state, action) => {
      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = action.payload;
    })
    .addCase(setCompanyConfig, (state) => {
      state.loading.appCompanyAndUser = true;
    })
    .addCase(setCompanyConfigSuccess, (state, action) => {
      if (state.appCompany && action.payload) {
        state.appCompany.config = { 
          ...state.appCompany.config,
          ...action.payload 
        };
      }
      state.loading.appCompanyAndUser = false;
    })
    .addCase(setCompanyConfigFailure, (state, action) => {
      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = action.payload;
    })
});

export default companyAndUserReducer;
