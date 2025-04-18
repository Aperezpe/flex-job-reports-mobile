import { createAction } from "@reduxjs/toolkit";
import { AppUser } from "../../types/Auth/AppUser";

export const fetchCompanyTechnicians = createAction("FETCH_COMPANY_TECHNICIANS");
export const fetchCompanyTechniciansSuccess = createAction<AppUser[]>("FETCH_COMPANY_TECHNICIANS_SUCCESS");
export const fetchCompanyTechniciansFailure = createAction<string>("FETCH_COMPANY_TECHNICIANS_FAILURE");