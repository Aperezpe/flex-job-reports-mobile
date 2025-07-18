// src/redux/reducers/clientsReducer.ts
import { createReducer } from "@reduxjs/toolkit";
import {
  fetchClientsSuccess,
  fetchClientsFailure,
  addClientSuccess,
  addClientFailure,
  fetchClients,
  addClient,
  removeClientSuccess,
  removeClientFailure,
  upsertClientAddress,
} from "../actions/clientsActions";
import { CLIENTS_PAGE_SIZE } from "../../api/clientsApi";
import _ from "lodash";
import { Client } from "../../types/Client";

interface ClientsState {
  clients: Client[];
  clientsLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: ClientsState = {
  clients: [],
  clientsLoading: false,
  error: null,
  page: 1,
  hasMore: true,
};

const clientsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchClients, (state) => {
      state.clientsLoading = true;
    })
    .addCase(fetchClientsSuccess, (state, action) => {
      state.clients = [...(state.clients ?? []), ...action.payload];
      state.clientsLoading = false;
      if (action.payload.length < CLIENTS_PAGE_SIZE) state.hasMore = false;
      state.page += 1;
    })
    .addCase(fetchClientsFailure, (state, action) => {
      state.error = action.payload;
      state.clientsLoading = false;
    })
    .addCase(addClient, (state) => {
      state.clientsLoading = true;
    })
    .addCase(addClientSuccess, (state, action) => {
      const index = _.sortedIndexBy(
        state.clients,
        action.payload,
        "clientName"
      );
      state.clients = [
        ...state.clients.slice(0, index),
        action.payload,
        ...state.clients.slice(index),
      ];
      state.clientsLoading = false;
    })
    .addCase(addClientFailure, (state, action) => {
      state.error = action.payload;
      state.clientsLoading = false;
    })
    .addCase(removeClientSuccess, (state, action) => {
      state.clients = state.clients.filter(
        (client) => client.id !== action.payload
      );
      state.clientsLoading = false;
    })
    .addCase(removeClientFailure, (state, action) => {
      state.error = action.payload;
      state.clientsLoading = false;
    })
    .addCase(upsertClientAddress, (state, action) => {
      const { clientId, address } = action.payload;
      const clientIndex = state.clients.findIndex(
        (client) => client.id === clientId
      );
    
      if (clientIndex !== -1) {
        const existingAddresses = state.clients[clientIndex].addresses || [];
        const addressIndex = existingAddresses.findIndex(
          (existingAddress) => existingAddress.id === address.id
        );
    
        let updatedAddresses;
        if (addressIndex !== -1) {
          // Update the existing address
          updatedAddresses = existingAddresses.map((existingAddress, index) =>
            index === addressIndex ? { ...address } : existingAddress
          );
        } else {
          // Insert the new address
          updatedAddresses = [...existingAddresses, address];
        }
    
        // Update the client with the new addresses array
        state.clients[clientIndex] = {
          ...state.clients[clientIndex],
          addresses: updatedAddresses,
        };
      }
      state.clientsLoading = false;
    });
});

export default clientsReducer;
