import { createSelector } from "reselect";
import { RootState } from "..";

const selectAppUser = (state: RootState) => state.appUserState.appUser;
const selectAppCompany = (state: RootState) => state.appCompanyState.appCompany;

export const selectUserAndCompany = createSelector(
  [selectAppUser, selectAppCompany],
  (appUser, appCompany) => ({ appUser, appCompany })
);