import { createAction } from "@reduxjs/toolkit";
import { Client } from "../../types/Client";

export const searchClientByNameOrAddress = createAction<string>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS");
export const searchClientByNameOrAddressSuccess = createAction<
  Client[]
>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS_SUCCESS");
export const searchClientByNameOrAddressFailure = createAction<string>(
  "SEARCH_CLIENT_BY_NAME_OR_ADDRESS_FAILURE"
);

export const clearSearchedClients = createAction('CLEAR_SEARCHED_CLIENTS');