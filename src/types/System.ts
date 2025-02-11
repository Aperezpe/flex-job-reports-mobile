
export interface System {
  id?: number;
  systemName?: string;
  systemType?: string;
  area?: string;
  tonnage?: number;
  lastService?: string;
  addressId?: number;
}

export interface SystemSQL {
  id?: number;
  system_name?: string;
  system_type?: string;
  area?: string;
  tonnage?: number;
  last_service?: string;
  address_id?: number;
}

export interface DropdownField {
  dropdownFields?: Set<string>;
}

export interface OpenDropdownField extends DropdownField {
  dropdownInputs?: {field: string, value: string}[];
}

export interface AddSystemFormValues extends OpenDropdownField {
  systemName: string;
  systemType: string;
  // systemTypeInput?: string;
  area: string;
  tonnage: number;
}

export const mapSystem = (sqlData: SystemSQL): System => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    systemName: sqlData.system_name,
    systemType: sqlData.system_type,
    area: sqlData.area,
    tonnage: sqlData.tonnage,
    addressId: sqlData.address_id,
    lastService: sqlData.last_service,
  };
};


