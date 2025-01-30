import { Address, AddressSQL, mapAddress } from "./Address";
import { Client, ClientSQL } from "./Client";

export interface ClientAndAddresses extends Client {
  addresses?: Address[];
}

export interface ClientAndAddressesSQL extends ClientSQL {
  addresses?: AddressSQL[];
}

export const mapClientAndAddresses = (
  sqlData: ClientAndAddressesSQL
): ClientAndAddresses => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    clientName: sqlData.client_name,
    clientCompanyName: sqlData.client_company_name,
    clientPhoneNumber: sqlData.client_phone_number,
    addresses: sqlData.addresses?.map((address) => mapAddress(address)),
  };
};
