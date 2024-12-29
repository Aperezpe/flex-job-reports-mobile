// address_title text null,
// address_street text not null,
// address_street_2 character varying null,
// address_city character varying null,
// address_state character varying null,
// address_zip_code character varying null,
// client_id bigint not null,

interface Address {
  addressTitle?: string;
  addressStreet?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  clientId?: string;
}
