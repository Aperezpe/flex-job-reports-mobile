import { UserStatus } from "../../types/Auth/AppUser";
import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCompanyTechnicians = (state: RootState) => state.technicians.technicians;

export const selectPendingTechnicians = createSelector(
  [selectCompanyTechnicians],
  (technicians) => technicians.filter((technician) => technician.status === UserStatus.PENDING)
);

export const selectAcceptedTechnicians = createSelector(
  [selectCompanyTechnicians],
  (technicians) => technicians.filter((technician) => technician.status === UserStatus.ACCEPTED)
);

export const selectTechniciansLoading = (state: RootState) =>
  state.technicians.techniciansLoading;
