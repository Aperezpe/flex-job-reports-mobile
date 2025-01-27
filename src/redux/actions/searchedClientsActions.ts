import { createAction } from "@reduxjs/toolkit";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";

export const searchClientByNameOrAddress = createAction<string>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS");
export const searchClientByNameOrAddressSuccess = createAction<
  ClientAndAddresses[]
>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS_SUCCESS");
export const searchClientByNameOrAddressFailure = createAction<string>(
  "SEARCH_CLIENT_BY_NAME_OR_ADDRESS_FAILURE"
);

export const clearSearchedClients = createAction('CLEAR_SEARCHED_CLIENTS');