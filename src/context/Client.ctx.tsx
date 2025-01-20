import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import useAsyncLoading from "../hooks/useAsyncLoading";
import { useCompanyAndUser } from "./CompanyAndUser.ctx";
import {
  ClientAndAddresses,
  mapClientAndAddresses,
} from "../types/ClientAndAddresses";
import { AddClientFormValues, ClientSQL } from "../types/Client";
import { AddAddressFormValues, AddressSQL } from "../types/Address";

interface ClientContextType {
  clients: ClientAndAddresses[];
  searchedClients: ClientAndAddresses[];
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: PostgrestError | null;
  page: number;
  hasMore: boolean;
  fetchClients: () => Promise<void>;
  fetchClientById: (clientId: string) => Promise<void>;
  searchClientByNameOrAddress: (query: string) => Promise<void>;
  resetClient: () => void;
  addClient: (values: AddClientFormValues) => Promise<void>;
  addAddress: (values: AddAddressFormValues) => Promise<void>;
  setSearchedClients: Dispatch<SetStateAction<ClientAndAddresses[]>>;
  client: ClientAndAddresses | null;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onEndReached: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { appCompany } = useCompanyAndUser();
  const { loading, callWithLoading, setLoading } = useAsyncLoading();
  const [query, setQuery] = useState("");

  const [error, setError] = useState<PostgrestError | null>(null);
  const [clients, setClients] = useState<ClientAndAddresses[]>([]);
  const [client, setClient] = useState<ClientAndAddresses | null>(null);
  const [searchedClients, setSearchedClients] = useState<
    ClientAndAddresses[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // reset client to null function
  const resetClient = () => setClient(null);

  const onEndReached = () => {
    if (!clients || loading || !hasMore) return;
    setPage((prevPage) => prevPage + 1);
  }

  useEffect(() => {
    if (appCompany) fetchClients();
  }, [page, appCompany]);

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

  const fetchClientById = async (clientId: string): Promise<void> => {
    callWithLoading(async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*, addresses(*)")
          .eq("id", clientId)
          .single();

        if (error) throw error;

        const client = mapClientAndAddresses(data);
        setClient(client);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClientById:", error);
      }
    });
  };

  const searchClientByNameOrAddress = async (
    query: string | null
  ): Promise<void> => {
    if (loading) return;

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
            const aMatches = a.address_string?.includes(query ?? "") ? 1 : 0;
            const bMatches = b.address_string?.includes(query ?? "") ? 1 : 0;
            return bMatches - aMatches; // Prioritize matches
          });
          return client;
        });

        const clientsRes = clientsWithSortedAddresses.map((client) =>
          mapClientAndAddresses(client)
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
            company_id: appCompany?.id,
          },
        ])
        .select("*, addresses(*)")
        .single();

      if (error) throw error;

      const newClient = mapClientAndAddresses(data);
      setClients([...(clients ?? []), newClient]);
    });
  };

  // add Address to a client
  const addAddress = async (values: AddAddressFormValues): Promise<void> => {
    callWithLoading(async () => {
      const { data, error } = await supabase
        .from("addresses")
        .insert<AddressSQL>([
          {
            client_id: client?.id?.toString(),
            address_title: values.title,
            address_street: values.street,
            address_street2: values.street2,
            address_city: values.city,
            address_state: values.state,
            address_zip_code: values.zipcode,
          },
        ])
        .select("*");

      if (error) throw error;

      const newAddress = data as AddressSQL;
      setClient((prevClient) => {
        if (!prevClient) return null;
        return {
          ...prevClient,
          addresses: [...(prevClient.addresses ?? []), newAddress],
        };
      });
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
        fetchClientById,
        searchClientByNameOrAddress,
        addClient,
        resetClient,
        addAddress,
        onEndReached,
        setSearchedClients,
        client,
        setLoading,
        setQuery,
        query,

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
