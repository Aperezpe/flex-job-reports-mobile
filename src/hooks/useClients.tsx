import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import useAsyncLoading from "./useAsyncLoading";
import { useCompanyAndUser } from "../context/CompanyAndUser.ctx";
import {
  ClientAndAddresses,
  mapClientAndAddresses,
} from "../types/ClientAndAddresses";
import { Address, AddressSQL } from "../types/Address";

export const useClients = () => {
  const { appCompany } = useCompanyAndUser();
  const { loading, callWithLoading } = useAsyncLoading();

  const [error, setError] = useState<PostgrestError | null>(null);
  const [clients, setClients] = useState<ClientAndAddresses[] | null>(null);
  const [searchedClients, setSearchedClients] = useState<
    ClientAndAddresses[] | null
  >(null);
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

  // TODO: Make sure it searches for weird symbols too
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
            .order("client_name", { ascending: true })

        if (errorUniqueClients) throw errorUniqueClients;

        // Sort addresses within each client to prioritize the queried address
        const clientsWithSortedAddresses = uniqueClients.map((client) => {
          client.addresses.sort((a: AddressSQL, b: AddressSQL) => {
            const aMatches = a.address_string?.includes(query) ? 1 : 0;
            const bMatches = b.address_string?.includes(query) ? 1 : 0;
            return bMatches - aMatches; // Prioritize matches
          });
          return client;
        });
        
        const clientsRes = clientsWithSortedAddresses.map((client: ClientAndAddresses) =>
          mapClientAndAddresses(client)
        );
        setSearchedClients(clientsRes);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClientByNameOrAddress:", error);
      }
    });
  };

  const addClient = () => {};

  useEffect(() => {
    fetchClients();
  }, [page]);

  return {
    clients,
    searchedClients,
    setSearchedClients,
    loading,
    error,
    page,
    setPage,
    fetchClients,
    searchClientByNameOrAddress,
  };
};

export default useClients;
