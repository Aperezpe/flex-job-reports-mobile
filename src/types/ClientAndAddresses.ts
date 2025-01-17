import { Address, AddressSQL } from "./Address";
import { Client, ClientSQL } from "./Client";

export interface ClientAndAddresses extends Client {
  addresses?: Address[];
};

export interface ClientAndAddressesSQL extends ClientSQL {
  addresses?: AddressSQL[]
}

export const mapClientAndAddresses = (sqlData: ClientAndAddressesSQL): ClientAndAddresses => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    clientName: sqlData.client_name,
    clientCompanyName: sqlData.client_company_name,
    clientPhoneNumber: sqlData.client_phone_number,
    addresses: sqlData.addresses?.map((address) => {
      return {
        id: address.id,
        addressTitle: address.address_title,
        addressString: address.address_string,
        addressStreet: address.address_street,
        addressStreet2: address.address_street2,
        addressCity: address.address_city,
        addressState: address.address_state,
        addressZipcode: address.address_zip_code
      }
    })
  }

}