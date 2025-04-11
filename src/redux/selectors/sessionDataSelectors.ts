import { UserStatus } from "../../types/Auth/AppUser";
import { SystemType } from "../../types/SystemType";
import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectAppCompanyAndUser = createSelector(
  (state: RootState) => state.sessionData.appCompany,
  (state: RootState) => state.sessionData.appUser,
  (state: RootState) =>
    state.sessionData.appUser?.status === UserStatus.ADMIN ||
    state.sessionData.appUser?.status === UserStatus.TECHNICIAN,
  (state: RootState) =>
    state.sessionData.appUser?.status === UserStatus.PENDING,
  (state: RootState) => state.sessionData.appUser?.status === UserStatus.ADMIN,
  (appCompany, appUser, isAllowedUser, isPendingTechnician, isAdmin) => ({
    appCompany,
    appUser,
    isAllowedUser,
    isPendingTechnician,
    isAdmin,
  })
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
