import { cloneDeep } from "lodash";

export interface JobReport {
  id: string;
  systemId: number;
  clientId: number;
  jobReport: Record<string, any>; // JSON object
  createdAt?: string;
  updatedAt?: string;
}


export interface JobReportSQL {
  id: string;
  system_id: number;
  client_id: number;
  job_report: Record<string, any>;
  created_at?: string;
  updated_at?: string; 
}


export const mapJobReport = (sqlData: JobReportSQL): JobReport => {
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
  };
};
