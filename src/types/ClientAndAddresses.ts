import { Address, AddressSQL } from "./Address";
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
    addresses: sqlData.addresses?.map((addressSQL) => ({
      id: addressSQL.id,
      addressTitle: addressSQL.address_title,
      addressString: addressSQL.address_string,
      addressStreet: addressSQL.address_street,
      addressStreet2: addressSQL.address_street_2,
      addressCity: addressSQL.address_city,
      addressState: addressSQL.address_state,
      addressZipcode: addressSQL.address_zip_code,
      systems: addressSQL.systems?.map((systemSQL) => ({
        id: systemSQL.id,
        systemName: systemSQL.system_name,
        systemType: systemSQL.system_type,
        area: systemSQL.area,
        tonnage: systemSQL.tonnage,
        lastService: systemSQL.last_service
      })),
    })),
  };
};
