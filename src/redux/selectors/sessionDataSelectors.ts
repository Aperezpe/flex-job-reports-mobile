import { SystemType } from "../../types/SystemType";
import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectAppCompanyAndUser = createSelector(
  (state: RootState) => state.sessionData.appCompany,
  (state: RootState) => state.sessionData.appUser,
  (appCompany, appUser) => ({ appCompany, appUser })
);

export const selectLoadingSessionData = (state: RootState) => {
  return state.sessionData.loading.appCompanyAndUser;
};

// Memoized selector for system types
export const selectVisibleSystemTypes = createSelector(
  (state: RootState) => state.sessionData.systemTypes,
  (systemTypes: SystemType[]) =>
    systemTypes.filter((systemType) => systemType.visible)
);

export const selectAllSystemTypes = (state: RootState) =>
  state.sessionData.systemTypes;

export const selectSystemTypeById = createSelector(
  [
    (state: RootState) => state.sessionData.systemTypes,
    (_: RootState, systemTypeId?: number) => systemTypeId,
  ],
  (systemTypes, systemTypeId) =>
    systemTypes.find((systemType) => systemType.id === systemTypeId) || null
);
