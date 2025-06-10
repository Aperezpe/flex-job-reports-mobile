import { Client } from "../../types/Client";
import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

export const selectClientDetails = (state: RootState): Client | null => state.clientDetails.client;
export const selectClientDetailsLoading = (state: RootState): boolean => state.clientDetails.clientDetailsLoading;
export const selectClientDetailsError = (state: RootState): string | null => state.clientDetails.error;

export const selectSystemAndAddressBySystemId = createSelector(
  [
    (state: RootState) => state.clientDetails.client,
    (_: RootState, systemId: number) => systemId,
  ],
  (client, systemId) => {
    if (!client) return { system: null, address: null };

    const addresses = client.addresses ?? [];
    const system = addresses
      .flatMap((address) => address.systems ?? [])
      .find((system) => system.id === systemId);

    if (!system) return { system: null, address: null };

    const address = addresses.find(
      (address) => address.id === system.addressId
    );

    return { system, address };
  }
);

