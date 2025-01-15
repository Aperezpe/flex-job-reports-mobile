export interface Address {
  id?: number;
  addressString?: string;
  addressTitle?: string;
  addressStreet?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  clientId?: string;
}

export interface AddressSQL {
  id?: number;
  address_string?: string;
  address_title?: string;
  address_street?: string;
  address_street2?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  client_id?: string;
}

export interface AddAddressFormValues {
  title: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zipcode: string;
}

