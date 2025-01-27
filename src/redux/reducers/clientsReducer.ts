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
} from "../actions/clientsActions";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import { PAGE_SIZE } from "../../api/clientsApi";
import _ from "lodash";

interface ClientsState {
  clients: ClientAndAddresses[];
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
      if (action.payload.length < PAGE_SIZE) state.hasMore = false;
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
    });
});

export default clientsReducer;
