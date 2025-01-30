import { supabase } from "../config/supabase";
import { AddAddressFormValues, AddressSQL } from "../types/Address";
import { AddSystemFormValues, SystemSQL } from "../types/System";

export const fetchClientByIdApi = async (clientId: number) =>
  await supabase
    .from("clients")
    .select("*, addresses(*, systems(*))")
    .eq("id", clientId)
    .single();

export const upsertAddressApi = async (
  values: AddAddressFormValues,
  clientId?: number,
  addressId?: number
) =>
  await supabase
    .from("addresses")
    .upsert({
      id: addressId ?? undefined,
      client_id: clientId,
      address_title: values.title,
      address_street: values.street,
      address_street_2: values.street2 || null,
      address_city: values.city,
      address_state: values.state,
      address_zip_code: values.zipcode,
    })
    .select("*, systems(*)")
    .single();

export const removeAddressApi = async (addressId: number) =>
  await supabase.from("addresses").delete().eq("id", addressId);

export const addSystemApi = async (
  values: AddSystemFormValues,
  addressId: number
) =>
  await supabase
    .from("systems")
    .insert<SystemSQL>([
      {
        system_name: values.systemName,
        system_type: values.systemType,
        area: values.area,
        tonnage: values.tonnage,
        address_id: addressId,
      },
    ])
    .select("*")
    .single();
