import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { Client, mapClientSQLToClient } from "../types/Client";
import useAsyncLoading from "./useAsyncLoading";
import { useCompanyAndUser } from "../context/CompanyAndUser.ctx";

export const useClients = () => {
  const { appCompany } = useCompanyAndUser();
  const { loading, callWithLoading } = useAsyncLoading();

  const [error, setError] = useState<PostgrestError | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);
  const [searchedClients, setSearchedClients] = useState<Client[] | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchClients = async (): Promise<void> => {
    if (loading || !hasMore) return;
    callWithLoading(async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("company_id", appCompany?.id)
          .order("client_name", { ascending: true })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) throw error;

        if (data.length < pageSize) {
          setHasMore(false); // No more items to fetch
        }

        const clientsRes = data.map((client) => mapClientSQLToClient(client));
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
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("company_id", appCompany?.id)
          .ilike("client_name", `%${query}%`)
          .order("client_name", { ascending: true });

        if (error) throw error;

        const clientsRes = data.map((client) => mapClientSQLToClient(client));
        setSearchedClients(clientsRes);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClientByNameOrAddress:", error);
      }
    });
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  return {
    clients,
    searchedClients,
    loading,
    error,
    page,
    setPage,
    fetchClients,
    searchClientByNameOrAddress,
  };
};

export default useClients;
