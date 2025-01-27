import { supabase } from "../config/supabase";
import { AddClientFormValues, ClientSQL } from "../types/Client";

export const PAGE_SIZE = 10;

export const fetchClientsApi = async (page: number, companyId: string) =>
  await supabase
    .from("clients")
    .select("*, addresses(*)")
    .eq("company_id", companyId)
    .order("client_name", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

export const addClientApi = async (
  values: AddClientFormValues,
  company_id: string
) =>
  await supabase
    .from("clients")
    .insert<ClientSQL>([
      {
        client_name: values.name,
        client_phone_number: values.phoneNumber,
        client_company_name: values.companyName,
        company_id: company_id,
      },
    ])
    .select("*, addresses(*)")
    .single();

export const removeClientIdApi = async (clientId: number) =>
  await supabase.from("clients").delete().eq("id", clientId).select('id').single();