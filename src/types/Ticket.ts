import { Address } from "./Address";
import { JobReport } from "./JobReport";
import { System } from "./System";

export interface TicketView {
  id?: string;
  ticketDate?: string;
  companyId?: string;
  addressId?: number;
  addressString?: string;
  clientId?: number;
  clientName?: string;
  technicianId?: string;
  technicianName?: string;
}

export interface TicketViewSQL {
  id?: string;
  ticket_date?: string;
  company_id?: string;
  address_id?: number;
  address_string?: string;
  client_id?: number;
  client_name?: string;
  technician_id?: string;
}

export interface TicketData {
  ticket?: TicketView,
  address?: Address,
  systems?: System[],
  jobReports: JobReport[];
  systemIds: number[]
}

export const mapTicket = (sqlData: TicketViewSQL): TicketView => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    companyId: sqlData.company_id,
    addressId: sqlData.address_id,
    addressString: sqlData.address_string,
    clientId: sqlData.client_id,
    clientName: sqlData.client_name,
    ticketDate: sqlData.ticket_date,
    technicianId: sqlData.technician_id
  };
};


