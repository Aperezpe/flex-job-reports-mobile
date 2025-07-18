import { createAction } from "@reduxjs/toolkit";
import { Company, CompanyConfig } from "../../types/Company";
import { AppUser } from "../../types/Auth/AppUser";
import { AddSystemTypeForm, SystemType } from "../../types/SystemType";

export const fetchCompanyAndUser = createAction<string>(
  "FETCH_COMPANY_AND_USER"
);
export const fetchCompanyAndUserSuccess = createAction<{
  company: Company;
  user: AppUser;
  systemTypes: SystemType[];
}>("FETCH_COMPANY_AND_USER_SUCCESS");
export const fetchCompanyAndUserFailure = createAction<string>(
  "FETCH_COMPANY_AND_USER_FAILURE"
);
export const setLoadingCompanyAndUser = createAction<boolean>(
  "SET_LOADING_COMPANY_AND_USER"
);

export const upsertSystemType = createAction<{
  values: AddSystemTypeForm;
  systemTypeId: number | null;
}>("UPSERT_SYSTEM_TYPE");
export const upsertSystemTypeSuccess = createAction<SystemType>(
  "UPSERT_SYSTEM_TYPE_SUCCESS"
);
export const upsertSystemTypeFailure = createAction<string>(
  "UPSERT_SYSTEM_TYPE_FAILURE"
);

export const hideSystemType = createAction<number>("HIDE_SYSTEM_TYPE");
export const hideSystemTypeSuccess = createAction<number>(
  "HIDE_SYSTEM_TYPE_SUCCESS"
);
export const hideSystemTypeFailure = createAction<string>(
  "HIDE_SYSTEM_TYPE_FAILURE"
);

export const leaveCompany = createAction<string | undefined>("LEAVE_COMPANY");
export const leaveCompanySuccess = createAction<AppUser>("LEAVE_COMPANY_SUCCESS");
export const leaveCompanyFailure = createAction<string>(
  "LEAVE_COMPANY_FAILURE"
);

export const setCompanyConfig = createAction<Company | null>("SET_COMPANY_CONFIG");
export const setCompanyConfigSuccess = createAction<CompanyConfig | null>("SET_COMPANY_CONFIG_SUCCESS");
export const setCompanyConfigFailure = createAction<string>("SET_COMPANY_CONFIG_FAILURE");