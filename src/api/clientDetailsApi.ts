import { supabase } from "../config/supabase";
import { AddAddressFormValues } from "../types/Address";
import { AddSystemFormValues } from "../types/System";

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

export const upsertSystemApi = async (
  values: AddSystemFormValues,
  addressId: number,
  systemId?: number,
) =>
  await supabase
    .from("systems")
    .upsert({
      id: systemId ?? undefined,
      system_type_id: values.systemTypeId,
      area: values.area || null,
      tonnage: values.tonnage || null,
      address_id: addressId,
    })
    .select("*")
    .single();

export const removeSystemApi = async (addressId: number, systemId: number) =>
  await supabase
    .from("systems")
    .delete()
    .eq("id", systemId)
    .eq("address_id", addressId);
