import { Client, ClientSQL, mapClient } from "./Client";
import { mapSystem, System, SystemSQL } from "./System";

export interface Address {
  id?: number;
  addressString?: string;
  addressStreet?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  clientId?: number;
  client?: Client;
  systems?: System[];
}

export interface AddressSQL {
  id?: number;
  address_string?: string;
  address_street?: string;
  address_street_2?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  client_id?: number;
  client?: ClientSQL;
  systems?: SystemSQL[];
}

export interface AddAddressFormValues {
  street: string;
  street2: string;
  city: string;
  state: string;
  zipcode: string;
}


export const mapAddress = (
  sqlData: AddressSQL
): Address => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    addressCity: sqlData.address_city,
    addressState: sqlData.address_state,
    addressStreet: sqlData.address_street,
    addressStreet2: sqlData.address_street_2,
    addressString: sqlData.address_string,
    addressZipcode: sqlData.address_zip_code,
    clientId: sqlData.client_id,
    client: mapClient(sqlData.client),
    systems: sqlData.systems?.map(system => mapSystem(system)),
  };
};

