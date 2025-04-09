import { RootState } from "../store";

export const selectCompanyTechnicians = (state: RootState) => state.technicians.technicians;

export const selectTechniciansLoading = (state: RootState) =>
  state.technicians.techniciansLoading;
