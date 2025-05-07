import { RootState } from "../store";

export const selectSearchedClients = (state: RootState) => state.searchedClients.searchedClients;
export const selectSearchedClientsLoading = (state: RootState) => state.searchedClients.loading;
export const selectSearchedClientsError = (state: RootState) => state.searchedClients.error;