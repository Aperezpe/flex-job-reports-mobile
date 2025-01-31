// src/redux/reducers/clientsReducer.ts
import { createReducer } from "@reduxjs/toolkit";
import {
  upsertAddress,
  upsertAddressFailure,
  upsertAddressSuccess,
  addSystem,
  addSystemFailure,
  addSystemSuccess,
  fetchClientById,
  fetchClientByIdFailure,
  fetchClientByIdSuccess,
  removeAddress,
  removeAddressFailure,
  removeAddressSuccess,
  resetClient,
} from "../actions/clientDetailsActions";
import { Client } from "../../types/Client";

interface ClientDetailsState {
  client: Client | null;
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
    .addCase(upsertAddress, (state) => {
      state.clientDetailsLoading = true; // TODO: needed? or create one for address loading?
    })
    .addCase(upsertAddressSuccess, (state, action) => {
      if (state.client) {
        const updatedAddresses = state.client.addresses?.map((address) => {
          if (address.id === action.payload.id) {
            // If update, replace the address
            return { ...action.payload };
          }
          return address;
        });

        // If the address was not found (insert case), push the new address
        if (
          !updatedAddresses?.some((address) => address.id === action.payload.id)
        ) {
          updatedAddresses?.push(action.payload);
        }

        // Update the state with the new list of addresses
        state.client.addresses = updatedAddresses;
      }
      state.clientDetailsLoading = false;
    })
    .addCase(upsertAddressFailure, (state, action) => {
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
    })
    // TODO: Do I need a loading component?
    .addCase(addSystemSuccess, (state, action) => {
      state.client?.addresses
        ?.find((address) => address.id === action.payload.addressId)
        ?.systems?.push(action.payload);
    })
    .addCase(addSystemFailure, (state, action) => {
      state.error = action.payload;
    });
});

export default clientDetailsReducer;
