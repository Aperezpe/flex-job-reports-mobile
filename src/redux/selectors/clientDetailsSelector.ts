import { Client } from "../../types/Client";
import { RootState } from "../store";

export const selectClientDetails = (state: RootState): Client | null => state.clientDetails.client;
export const selectClientDetailsError = (state: RootState): string | null => state.clientDetails.error;