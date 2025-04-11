export interface AppUser {
  id?: string;
  fullName?: string;
  status?: UserStatus | null;
  companyId?: string | null;
}

export interface AppUserSQL {
  id?: string;
  full_name?: string;
  status?: UserStatus | null;
  company_id?: string | null;
}

export const mapAppUserSQLToAppUser = (sqlData?: AppUserSQL): AppUser => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    fullName: sqlData.full_name,
    companyId: sqlData.company_id,
    status: sqlData.status,
  };
};

export interface AppUserResponse {
  user: AppUserSQL | null;
}

export enum UserStatus {
  TECHNICIAN = "TECHNICIAN",
  ADMIN = "ADMIN",
  PENDING = "PENDING",
}
