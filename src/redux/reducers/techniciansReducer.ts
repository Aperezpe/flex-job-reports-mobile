import { createReducer } from "@reduxjs/toolkit";
import {
  fetchCompanyTechnicians,
  fetchCompanyTechniciansFailure,
  fetchCompanyTechniciansSuccess,
  updateTechnicianStatus,
  updateTechnicianStatusFailure,
  updateTechnicianStatusSuccess,
} from "../actions/techniciansActions";
import { AppUser } from "../../types/Auth/AppUser";

interface TechniciansState {
  technicians: AppUser[];
  techniciansLoading: boolean;
  error: string | null;
}

const initialState: TechniciansState = {
  technicians: [],
  techniciansLoading: false,
  error: null,
};

const techniciansReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchCompanyTechnicians, (state) => {
      state.techniciansLoading = true;
    })
    .addCase(fetchCompanyTechniciansSuccess, (state, action) => {
      state.technicians = action.payload;
      state.techniciansLoading = false;
    })
    .addCase(fetchCompanyTechniciansFailure, (state, action) => {
      state.error = action.payload;
      state.techniciansLoading = false;
    })
    .addCase(updateTechnicianStatus, (state) => {
      state.techniciansLoading = true;
    })
    .addCase(updateTechnicianStatusSuccess, (state, action) => {
      state.techniciansLoading = false;
      const updatedTechnician = action.payload;
      // If only ID is available, it means technician unlinked from company in DB, so only the ID will return back
      if (updatedTechnician.id && Object.keys(updatedTechnician).length === 1) {
        state.technicians = state.technicians.filter(
          (technician) => technician.id !== updatedTechnician.id
        );
      } else {
        state.technicians = state.technicians.map((technician) =>
          technician.id === updatedTechnician.id ? { ...technician, ...updatedTechnician } : technician
        );
      }
    })
    .addCase(updateTechnicianStatusFailure, (state, action) => {
      state.techniciansLoading = false;
      state.error = action.payload;
    })
});

export default techniciansReducer;
