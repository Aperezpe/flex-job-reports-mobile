import { createAction } from "@reduxjs/toolkit";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";

export const searchClientByNameOrAddress = createAction<{
  companyId: string;
  query: string;
}>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS");
export const searchClientByNameOrAddressSuccess = createAction<
  ClientAndAddresses[]
>("SEARCH_CLIENT_BY_NAME_OR_ADDRESS_SUCCESS");
export const searchClientByNameOrAddressFailure = createAction<string>(
  "SEARCH_CLIENT_BY_NAME_OR_ADDRESS_FAILURE"
);

export const setQuery = createAction<string>("SET_QUERY");
