export interface Client {
  id?: number;
  clientName?: string;
  clientPhoneNumber?: string;
  clientCompanyName?: string;
}

export interface ClientSQL {
  id?: number;
  client_name?: string;
  client_phone_number?: string;
  client_company_name?: string;
}

export const mapClientSQLToClient = (sqlData: ClientSQL): Client => {
  return {
    id: sqlData.id,
    clientName: sqlData.client_name,
    clientCompanyName: sqlData.client_company_name,
    clientPhoneNumber: sqlData.client_phone_number,
  };
};
