import { supabase } from "../config/supabase";
import { AddAddressFormValues, AddressSQL } from "../types/Address";

export const fetchClientByIdApi = async (clientId: number) =>
  await supabase
    .from("clients")
    .select("*, addresses(*, systems(*))")
    .eq("id", clientId)
    .single();

export const addAddressApi = async (
  values: AddAddressFormValues,
  clientId?: number
) =>
  await supabase
    .from("addresses")
    .insert<AddressSQL>([
      {
        client_id: clientId,
        address_title: values.title,
        address_street: values.street,
        address_street_2: values.street2,
        address_city: values.city,
        address_state: values.state,
        address_zip_code: values.zipcode,
      },
    ])
    .select("*")
    .single();

export const removeAddressApi = async (addressId: number) =>
  await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
