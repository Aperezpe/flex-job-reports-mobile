import { createAction } from "@reduxjs/toolkit";
import { AppUser, UserStatus } from "../../types/Auth/AppUser";

export const fetchCompanyTechnicians = createAction("FETCH_COMPANY_TECHNICIANS");
export const fetchCompanyTechniciansSuccess = createAction<AppUser[]>("FETCH_COMPANY_TECHNICIANS_SUCCESS");
export const fetchCompanyTechniciansFailure = createAction<string>("FETCH_COMPANY_TECHNICIANS_FAILURE");

export const updateTechnicianStatus = createAction<{ technicianId: string, status: UserStatus | null }>('UPDATE_TECHNICIAN_STATUS');
export const updateTechnicianStatusSuccess = createAction<AppUser>('UPDATE_TECHNICIAN_STATUS_SUCCESS');
export const updateTechnicianStatusFailure = createAction<string>('UPDATE_TECHNICIAN_STATUS_FAILURE');