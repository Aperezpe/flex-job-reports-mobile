import { cloneDeep } from "lodash";
import { mapSystem, System, SystemSQL } from "./System";

export interface JobReport {
  id: string;
  systemId: number;
  clientId?: number;
  reportData: ReportData[]; // JSON object
  createdAt?: string;
  updatedAt?: string;
  system?: System;
  ticketId?: string;
}

export interface JobReportSQL {
  id: string;
  system_id: number;
  client_id?: number;
  job_report: ReportData[];
  created_at?: string;
  updated_at?: string;
  job_date?: string;
  system?: SystemSQL;
  ticket_id?: string;
}

export interface ReportData {
  fields?: ReportField[];
  sectionName?: string;
}

export interface ReportField {
  name?: string;
  value?: any;
}

export interface JobReportView extends JobReport {
  address?: string;
  clientName?: string;
  companyId?: string;
}

export interface JobReportViewSQL extends JobReportSQL {
  address?: string;
  client_name?: string;
  company_id?: string;
}


export const mapJobReport = (sqlData: JobReportSQL | null): JobReport => {
  if (!sqlData) {
    throw new Error("Invalid SQL data");
  }
  return {
    id: sqlData.id,
    systemId: sqlData.system_id,
    clientId: sqlData.client_id,
    reportData: cloneDeep(sqlData.job_report),
    system: mapSystem(sqlData.system),
    ticketId: sqlData.ticket_id,
  };
};

export const mapJobReportView = (sqlData: JobReportViewSQL): JobReportView => {
  if (!sqlData) {
    throw new Error("Invalid SQL data");
  }
  return {
    id: sqlData.id,
    systemId: sqlData.system_id,
    clientId: sqlData.client_id,
    reportData: cloneDeep(sqlData.job_report),
    createdAt: sqlData.created_at,
    updatedAt: sqlData.updated_at,
    address: sqlData.address,
    clientName: sqlData.client_name,
    companyId: sqlData.company_id,
    ticketId: sqlData.ticket_id,
  };
};
