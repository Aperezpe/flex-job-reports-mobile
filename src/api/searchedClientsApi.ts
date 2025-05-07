import { supabase } from "../config/supabase";

export const searchClientByNameOrAddressApi = async (
  companyId: string,
  query: string
) => {
  const { data: clientsByName, error: errorClientsByName } = await supabase
    .from("clients")
    .select("*, addresses(*)")
    .eq("company_id", companyId)
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

  return await supabase
    .from("clients")
    .select("*, addresses(*)")
    .eq("company_id", companyId)
    .in("id", [...combinedClientIds])
    .order("client_name", { ascending: true });
};
