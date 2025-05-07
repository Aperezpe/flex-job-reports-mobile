
export type AddSystemTypeForm = {
  systemType: string;
};

export interface SystemType {
  id?: number;
  systemType?: string;
  companyId?: string;
  visible?: boolean;
}

export interface SystemTypeSQL {
  id?: number;
  system_type?: string;
  company_id?: string;
  visible?: boolean;
}

export const mapSystemType = (sqlData: SystemTypeSQL): SystemType => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    systemType: sqlData.system_type,
    companyId: sqlData.company_id,
    visible: sqlData.visible
  };
};

export const getSystemTypeName = (
  systemTypes: SystemType[],
  systemTypeId: number | undefined
): string | undefined => {
  return systemTypes.find((systemType) => systemType.id === systemTypeId)
    ?.systemType;
};