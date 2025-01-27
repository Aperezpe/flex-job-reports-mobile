export interface Client {
  id?: number;
  clientName?: string;
  clientPhoneNumber?: string;
  clientCompanyName?: string;
  companyId?: string;
}

export interface ClientSQL {
  id?: number;
  client_name?: string;
  client_phone_number?: string;
  client_company_name?: string;
  company_id?: string;
}

export interface AddClientFormValues {
  name: string;
  phoneNumber?: string;
  companyName?: string;
}

export interface ClientSection {
  title: string;
  data: Client[];
}

export const mapClientSQLToClient = (sqlData?: ClientSQL): Client => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    clientName: sqlData.client_name,
    clientCompanyName: sqlData.client_company_name,
    clientPhoneNumber: sqlData.client_phone_number,
    companyId: sqlData.company_id,
  };
};
