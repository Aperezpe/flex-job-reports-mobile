import { UserStatus } from "../../types/Auth/AppUser";
import { SystemType } from "../../types/SystemType";
import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectAppCompanyAndUser = createSelector(
  (state: RootState) => state.sessionData.appCompany,
  (state: RootState) => state.sessionData.appUser,
  (appCompany, appUser) => {
    const status = appUser?.status;

    const isAdmin = status === UserStatus.ADMIN;
    const isTechnician = status === UserStatus.TECHNICIAN;
    const isNoCompanyUser = !status;
    const isTechnicianOrAdmin = appUser?.id && (isAdmin || isTechnician) && appCompany?.id;

    console.log("appUser: ", JSON.stringify(appUser, null, 2))

    return {
      appCompany,
      appUser,
      isTechnicianOrAdmin,
      isAdmin,
      isNoCompanyUser,
    };
  }
);

export const selectLoadingSessionData = (state: RootState) => {
  return state.sessionData.loading.appCompanyAndUser;
};

export const selectErrorInAppUserAndCompany = (state: RootState) => {
  return state.sessionData.error.appCompanyAndUser;
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

export const selectCompanyConfig = (state: RootState) =>
  state.sessionData.appCompany?.config || null;
