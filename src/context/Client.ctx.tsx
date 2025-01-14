import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import useAsyncLoading from "../hooks/useAsyncLoading";
import { useCompanyAndUser } from "./CompanyAndUser.ctx";
import { ClientAndAddresses, mapClientAndAddresses } from "../types/ClientAndAddresses";
import { AddClientFormValues, ClientSQL } from "../types/Client";
import { AddressSQL } from "../types/Address";

interface ClientContextType {
  clients: ClientAndAddresses[] | null;
  searchedClients: ClientAndAddresses[] | null;
  loading: boolean;
  error: PostgrestError | null;
  page: number;
  hasMore: boolean;
  fetchClients: () => Promise<void>;
  searchClientByNameOrAddress: (query: string) => Promise<void>;
  addClient: (values: AddClientFormValues) => Promise<void>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchedClients: React.Dispatch<React.SetStateAction<ClientAndAddresses[] | null>>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { appCompany } = useCompanyAndUser();
  const { loading, callWithLoading } = useAsyncLoading();

  const [error, setError] = useState<PostgrestError | null>(null);
  const [clients, setClients] = useState<ClientAndAddresses[] | null>(null);
  const [searchedClients, setSearchedClients] = useState<ClientAndAddresses[] | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchClients = async (): Promise<void> => {
    if (loading || !hasMore) return;
    callWithLoading(async () => {
      try {
        const { error, data } = await supabase
          .from("clients")
          .select("*, addresses(*)")
          .eq("company_id", appCompany?.id)
          .order("client_name", { ascending: true })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) throw error;

        if (data.length < pageSize) {
          setHasMore(false); // No more items to fetch
        }

        const clientsRes = data.map((client) => mapClientAndAddresses(client));
        setClients([...(clients ?? []), ...clientsRes]);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClients:", error);
      }
    });
  };

  const searchClientByNameOrAddress = async (query: string): Promise<void> => {
    if (loading) return;
    else if (!query) {
      setSearchedClients(null);
      return;
    }

    callWithLoading(async () => {
      try {
        const { data: clientsByName, error: errorClientsByName } =
          await supabase
            .from("clients")
            .select("*, addresses(*)")
            .eq("company_id", appCompany?.id)
            .ilike("client_name", `%${query}%`)
            .order("client_name", { ascending: true });

        if (errorClientsByName) throw errorClientsByName;

        const { data: clientsByAddress, error: errorClientsByAddress } =
          await supabase
            .from("addresses")
            .select("client_id")
            .ilike("address_string", `%${query}%`);

        if (errorClientsByAddress) throw errorClientsByAddress;

        const clientIdsFromAddresses =
          clientsByAddress?.map((address) => address.client_id) ?? [];

        const combinedClientIds = new Set([
          ...(clientsByName || []).map((client) => client.id),
          ...clientIdsFromAddresses,
        ]);

        const { data: uniqueClients, error: errorUniqueClients } =
          await supabase
            .from("clients")
            .select("*, addresses(*)")
            .eq("company_id", appCompany?.id)
            .in("id", [...combinedClientIds])
            .order("client_name", { ascending: true });

        if (errorUniqueClients) throw errorUniqueClients;

        const clientsWithSortedAddresses = uniqueClients.map((client) => {
          client.addresses.sort((a: AddressSQL, b: AddressSQL) => {
            const aMatches = a.address_string?.includes(query) ? 1 : 0;
            const bMatches = b.address_string?.includes(query) ? 1 : 0;
            return bMatches - aMatches; // Prioritize matches
          });
          return client;
        });

        const clientsRes = clientsWithSortedAddresses.map(
          (client) => mapClientAndAddresses(client)
        );

        setSearchedClients(clientsRes);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClientByNameOrAddress:", error);
      }
    });
  };

  const addClient = async (values: AddClientFormValues): Promise<void> => {
    callWithLoading(async () => {
      const { data, error } = await supabase
      .from("clients")
      .insert<ClientSQL>([
        {
          client_name: values.name,
          client_phone_number: values.phoneNumber,
          client_company_name: values.companyName,
          company_id: appCompany?.id
        },
      ])
      .select("*, addresses(*)")
      .single();

      if (error) throw error;

      const newClient = mapClientAndAddresses(data);
      setClients([...(clients ?? []), newClient]);
    });
   
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        searchedClients,
        loading,
        error,
        page,
        hasMore,
        fetchClients,
        searchClientByNameOrAddress,
        addClient,
        setPage,
        setSearchedClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientProvider");
  }
  return context;
};