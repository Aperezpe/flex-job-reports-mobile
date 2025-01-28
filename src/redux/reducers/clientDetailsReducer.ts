// src/redux/reducers/clientsReducer.ts
import { createReducer } from "@reduxjs/toolkit";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import {
  addAddress,
  addAddressFailure,
  addAddressSuccess,
  fetchClientById,
  fetchClientByIdFailure,
  fetchClientByIdSuccess,
  removeAddress,
  removeAddressFailure,
  removeAddressSuccess,
  resetClient,
} from "../actions/clientDetailsActions";

interface ClientDetailsState {
  client: ClientAndAddresses | null;
  error: string | null;
  clientDetailsLoading: boolean;
}

const initialState: ClientDetailsState = {
  client: null,
  error: null,
  clientDetailsLoading: false,
};

const clientDetailsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchClientById, (state) => {
      state.clientDetailsLoading = true;
    })
    .addCase(fetchClientByIdSuccess, (state, action) => {
      state.client = action.payload;
      state.clientDetailsLoading = false;
    })
    .addCase(fetchClientByIdFailure, (state, action) => {
      state.error = action.payload;
      state.clientDetailsLoading = false;
    })
    .addCase(resetClient, (state) => {
      Object.assign(state, initialState);
    })
    .addCase(addAddress, (state) => {
      state.clientDetailsLoading = true;
    })
    .addCase(addAddressSuccess, (state, action) => {
      state.client?.addresses?.push(action.payload);
      state.clientDetailsLoading = false;
    })
    .addCase(addAddressFailure, (state, action) => {
      state.error = action.payload;
      state.clientDetailsLoading = false;
    })
    .addCase(removeAddress, (state) => {
      state.clientDetailsLoading = true;
    })
    .addCase(removeAddressSuccess, (state, action) => {
      if (state.client && state.client.addresses) {
        state.client.addresses = state.client.addresses.filter(
          (address) => address.id !== action.payload
        );
      }
      state.clientDetailsLoading = false;
    })
    .addCase(removeAddressFailure, (state, action) => {
      state.error = action.payload;
      state.clientDetailsLoading = false;
    });
});

export default clientDetailsReducer;
