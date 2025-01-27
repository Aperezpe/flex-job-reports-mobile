import { createReducer } from "@reduxjs/toolkit";

import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import {
  clearSearchedClients,
  searchClientByNameOrAddress,
  searchClientByNameOrAddressFailure,
  searchClientByNameOrAddressSuccess,
} from "../actions/searchedClientsActions";

interface SearchedClientsState {
  searchedClients: ClientAndAddresses[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchedClientsState = {
  searchedClients: [],
  loading: false,
  error: null,
};

const searchedClientsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(searchClientByNameOrAddress, (state) => {
      state.loading = true;
    })
    .addCase(searchClientByNameOrAddressSuccess, (state, action) => {
      state.searchedClients = action.payload;
      state.loading = false;
    })
    .addCase(searchClientByNameOrAddressFailure, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(clearSearchedClients, (state) => {
      state.searchedClients = [];
    })
});

export default searchedClientsReducer;
