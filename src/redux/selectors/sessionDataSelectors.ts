import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectAppCompanyAndUser = createSelector(
  (state: RootState) => state.sessionData.appCompany,
  (state: RootState) => state.sessionData.appUser,
  (appCompany, appUser) => ({ appCompany, appUser })
);

export const selectLoadingCompanyAndUser = (state: RootState) => {
  return state.sessionData.loadingCompanyAndUser;
}
