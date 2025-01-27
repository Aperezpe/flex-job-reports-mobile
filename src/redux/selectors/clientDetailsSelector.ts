import { RootState } from "../store";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";

export const selectClientDetails = (state: RootState): ClientAndAddresses | null => state.clientDetails.client;