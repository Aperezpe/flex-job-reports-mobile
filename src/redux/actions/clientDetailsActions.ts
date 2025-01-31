import { createAction } from "@reduxjs/toolkit";
import { AddAddressFormValues, Address } from "../../types/Address";
import { AddSystemFormValues, System } from "../../types/System";
import { Client } from "../../types/Client";

export const fetchClientById = createAction<number>("FETCH_CLIENT_BY_ID");
export const fetchClientByIdSuccess = createAction<Client>(
  "FETCH_CLIENT_BY_ID_SUCCESS"
);
export const fetchClientByIdFailure = createAction<string>(
  "FETCH_CLIENT_BY_ID_FAILURE"
);

export const upsertAddress = createAction<{
  values: AddAddressFormValues;
  addressId?: number;
}>("UPSERT_ADDRESS");
export const upsertAddressSuccess = createAction<Address>(
  "UPSERT_ADDRESS_SUCCESS"
);
export const upsertAddressFailure = createAction<string>("UPSERT_ADDRESS_FAILURE");

export const removeAddress = createAction<number>("REMOVE_ADDRESS");
export const removeAddressSuccess = createAction<number>(
  "REMOVE_ADDRESS_SUCCESS"
);
export const removeAddressFailure = createAction<string>(
  "REMOVE_ADDRESS_FAILURE"
);

export const addSystem = createAction<{
  values: AddSystemFormValues;
  addressId: number;
}>("ADD_SYSTEM");
export const addSystemSuccess = createAction<System>("ADD_SYSTEM_SUCCESS");
export const addSystemFailure = createAction<string>("ADD_SYSTEM_FAILURE");

export const resetClient = createAction("RESET_CLIENT");
