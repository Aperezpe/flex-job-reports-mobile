import { useEffect, useState } from "react";
import {
  PostgrestError,
} from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { Client, mapClientSQLToClient } from "../types/Client";
import useAsyncLoading from "./useAsyncLoading";
import { useCompanyAndUser } from "../context/CompanyAndUser.ctx";

export const useClients = () => {
  const [clients, setClients] = useState<Client[] | null>(null);
  const { appCompany } = useCompanyAndUser();
  const [error, setError] = useState<PostgrestError | null>(null);
  const { loading, callWithLoading } = useAsyncLoading();

  const fetchClients = async (): Promise<void> => {
    callWithLoading(async () => {
      try {
        const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", appCompany?.id);

        if (error) throw error;

        const clientsRes = data.map((client) => mapClientSQLToClient(client));
        setClients(clientsRes);
      } catch (error) {
        setError(error as PostgrestError);
        console.log("Error while fetchClients:", error);
      } 
    })
  };

  // TODO: save companyID in session storage so that is not needed as param.
  const searchClientByNameOrAddress = async (query: string): Promise<void> => {
    callWithLoading(async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("company_id", appCompany?.id)
          .ilike("client_name", `%${query}%`);

        if (error) throw error;

        const clientsRes = data.map((client) => mapClientSQLToClient(client));
        setClients(clientsRes);
      } catch (error) {
        setError(error as PostgrestError)
        console.log("Error while fetchClientByNameOrAddress:", error)
      }
     
    });
  };

  useEffect(() => {
    if (appCompany?.id) { 
      fetchClients() 
    };
  }, [appCompany?.id]);

  return { clients, loading, error, fetchClients, searchClientByNameOrAddress };
};

export default useClients;
