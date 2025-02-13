import { createReducer } from "@reduxjs/toolkit";
import { Company } from "../../types/Company";
import { AppUser } from "../../types/Auth/AppUser";
import {
  deleteSystemType,
  deleteSystemTypeFailure,
  deleteSystemTypeSuccess,
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
  upsertSystemType,
  upsertSystemTypeFailure,
  upsertSystemTypeSuccess,
} from "../actions/sessionDataActions";
import { SystemType } from "../../types/SystemType";

interface CompanyAndUserState {
  appCompany: Company | null;
  appUser: AppUser | null;
  systemTypes: SystemType[];
  loading: {
    appCompanyAndUser: boolean;
    systemTypes: boolean;
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
    systemTypes: false,
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
      state.systemTypes = action.payload.company.systemTypes ?? [];

      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = null;
    })
    .addCase(fetchCompanyAndUserFailure, (state, action) => {
      state.loading.appCompanyAndUser = false;
      state.error.appCompanyAndUser = action.payload;
    })
    // .addCase(clearCompanyAndUser, (state) => {
    //   state.appCompany = null;
    //   state.appUser = null;
    //   state.systemTypes = [];
    // })
    .addCase(upsertSystemType, (state) => {
      state.loading.systemTypes = true;
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
      state.loading.systemTypes = false;
    })
    .addCase(upsertSystemTypeFailure, (state, action) => {
      state.error.systemTypes = action.payload;
      state.loading.systemTypes = false;
    })
    .addCase(deleteSystemType, (state, action) => {
      state.loading.systemTypes = true;
    })
    .addCase(deleteSystemTypeSuccess, (state, action) => {
      // delete from state
      state.loading.systemTypes = false;
    })
    .addCase(deleteSystemTypeFailure, (state, action) => {
      state.error.systemTypes = action.payload;
      state.loading.systemTypes = false;
    });
});

export default companyAndUserReducer;
