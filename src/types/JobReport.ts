import { cloneDeep } from "lodash";
import { Client, ClientSQL, mapClient } from "./Client";
import { mapSystem, System, SystemSQL } from "./System";

export interface JobReport {
  id: string;
  systemId: number;
  clientId: number;
  jobReport: Record<string, any>; // JSON object
  createdAt?: string;
  updatedAt?: string;
  jobDate?: string;
  technicians: string[];
  client?: Client;
  system?: System;
}


export interface JobReportSQL {
  id: string;
  system_id: number;
  client_id: number;
  job_report: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  job_date?: string;
  technicians?: string[];
  client?: ClientSQL;
  system?: SystemSQL;
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
    jobReport: cloneDeep(sqlData.job_report),
    // createdAt: sqlData.created_at,
    // updatedAt: sqlData.updated_at,
    jobDate: sqlData.job_date,
    technicians: sqlData.technicians || [],
    // client: mapClient(sqlData.client),
    system: mapSystem(sqlData.system),
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
    jobReport: cloneDeep(sqlData.job_report),
    createdAt: sqlData.created_at,
    updatedAt: sqlData.updated_at,
    jobDate: sqlData.job_date,
    technicians: sqlData.technicians || [],
    client: mapClient(sqlData.client),
    address: sqlData.address,
    clientName: sqlData.client_name,
    companyId: sqlData.company_id,
  };
};
