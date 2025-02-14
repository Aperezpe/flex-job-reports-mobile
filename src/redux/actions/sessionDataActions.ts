import { createAction } from "@reduxjs/toolkit";
import { Company } from "../../types/Company";
import { AppUser } from "../../types/Auth/AppUser";
import { AddSystemTypeForm, SystemType } from "../../types/SystemType";

export const fetchCompanyAndUser = createAction<string>(
  "FETCH_COMPANY_AND_USER"
);
export const fetchCompanyAndUserSuccess = createAction<{
  company: Company;
  user: AppUser;
}>("FETCH_COMPANY_AND_USER_SUCCESS");
export const fetchCompanyAndUserFailure = createAction<string>(
  "FETCH_COMPANY_AND_USER_FAILURE"
);
export const clearCompanyAndUser = createAction("CLEAR_COMPANY_AND_USER"); // TODO: I've deleted use for this. Keep an eye and delete if not necessary
export const setLoadingCompanyAndUser = createAction<boolean>(
  "SET_LOADING_COMPANY_AND_USER"
);

export const upsertSystemType = createAction<{
  values: AddSystemTypeForm;
  systemTypeId?: number;
}>("UPSERT_SYSTEM_TYPE");
export const upsertSystemTypeSuccess = createAction<SystemType>(
  "UPSERT_SYSTEM_TYPE_SUCCESS"
);
export const upsertSystemTypeFailure = createAction<string>(
  "UPSERT_SYSTEM_TYPE_FAILURE"
);

export const removeSystemType = createAction<number>("REMOVE_SYSTEM_TYPE");
export const removeSystemTypeSuccess = createAction<number>(
  "REMOVE_SYSTEM_TYPE_SUCCESS"
);
export const removeSystemTypeFailure = createAction<string>(
  "REMOVE_SYSTEM_TYPE_FAILURE"
);
