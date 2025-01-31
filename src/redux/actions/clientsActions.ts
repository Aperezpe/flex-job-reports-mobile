import { createAction } from '@reduxjs/toolkit';
import { AddClientFormValues, Client } from '../../types/Client';

export const fetchClients = createAction('FETCH_CLIENTS');
export const fetchClientsSuccess = createAction<Client[]>('FETCH_CLIENTS_SUCCESS');
export const fetchClientsFailure = createAction<string>('FETCH_CLIENTS_FAILURE');

export const addClient = createAction<AddClientFormValues>('ADD_CLIENT');
export const addClientSuccess = createAction<Client>('ADD_CLIENT_SUCCESS');
export const addClientFailure = createAction<string>('ADD_CLIENT_FAILURE');

export const removeClient = createAction<number>('REMOVE_CLIENT');
export const removeClientSuccess = createAction<number>('REMOVE_CLIENT_SUCCESS');
export const removeClientFailure = createAction<string>('REMOVE_CLIENT_FAILURE');