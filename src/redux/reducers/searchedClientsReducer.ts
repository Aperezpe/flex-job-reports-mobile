import { createReducer } from '@reduxjs/toolkit';

import { ClientAndAddresses } from '../../types/ClientAndAddresses';
import { searchClientByNameOrAddressFailure, searchClientByNameOrAddressSuccess, setQuery } from '../actions/searchedClientsActions';

interface SearchedClientsState {
  searchedClients: ClientAndAddresses[];
  loading: boolean;
  error: string | null;
  query: string;
}

const initialState: SearchedClientsState = {
  searchedClients: [],
  loading: false,
  error: null,
  query: '',
};

const clientsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(searchClientByNameOrAddressSuccess, (state, action) => {
      state.searchedClients = action.payload;
      state.loading = false;
    })
    .addCase(searchClientByNameOrAddressFailure, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    })
    .addCase(setQuery, (state, action) => {
      state.query = action.payload;
    });
});

export default clientsReducer;