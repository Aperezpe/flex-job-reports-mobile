import { createAction } from "@reduxjs/toolkit";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import { AddAddressFormValues, Address } from "../../types/Address";

export const fetchClientById = createAction<number>('FETCH_CLIENT_BY_ID');
export const fetchClientByIdSuccess = createAction<ClientAndAddresses>('FETCH_CLIENT_BY_ID_SUCCESS');
export const fetchClientByIdFailure = createAction<string>('FETCH_CLIENT_BY_ID_FAILURE');

export const addAddress = createAction<AddAddressFormValues>('ADD_ADDRESS');
export const addAddressSuccess = createAction<Address>('ADD_ADDRESS_SUCCESS');
export const addAddressFailure = createAction<string>('ADD_ADDRESS_FAILURE');

export const removeAddress = createAction<number>('REMOVE_ADDRESS');
export const removeAddressSuccess = createAction<number>('REMOVE_ADDRESS_SUCCESS');
export const removeAddressFailure = createAction<string>('REMOVE_ADDRESS_FAILURE');

export const resetClient = createAction('RESET_CLIENT');

