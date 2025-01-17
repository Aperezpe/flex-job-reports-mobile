export interface System {
  id?: number;
  systemName?: string;
  systemType?: string;
  area?: string;
  tonnage?: string;
  lastService?: string;
  addressId?: number;
}

export interface SystemSQL {
  id?: number;
  system_name?: string;
  system_type?: string;
  area?: string;
  tonnage?: string;
  last_service?: string;
  address_id?: number;
}

export interface AddSystemFormValues {
  systemName: string;
  systemType: string;
  area: string;
  tonnage: string;
}

