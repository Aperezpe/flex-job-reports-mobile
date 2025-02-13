
export type AddSystemTypeForm = {
  systemType: string;
};

export interface SystemType {
  id?: number;
  systemType?: string;
  companyId?: string;
}

export interface SystemTypeSQL {
  id?: number;
  system_type?: string;
  company_id?: string;
}

export const mapSystemType = (sqlData: SystemTypeSQL): SystemType => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    systemType: sqlData.system_type,
    companyId: sqlData.company_id,
  };
};
