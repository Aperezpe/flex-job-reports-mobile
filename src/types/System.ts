
export interface System {
  id?: number;
  systemName?: string;
  systemTypeId?: number;
  area?: string;
  tonnage?: number;
  lastService?: string;
  addressId?: number;
}

export interface SystemSQL {
  id?: number;
  system_name?: string;
  system_type_id?: number;
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
  systemTypeId: number | null;
  area: string;
  tonnage: number;
}

export const mapSystem = (sqlData: SystemSQL): System => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    systemName: sqlData.system_name,
    systemTypeId: sqlData.system_type_id,
    area: sqlData.area,
    tonnage: sqlData.tonnage,
    addressId: sqlData.address_id,
    lastService: sqlData.last_service,
  };
};


