
export interface AppUser {
  id?: string,
  fullName?: string,
  status?: string,
  companyId?: string
}

export interface AppUserSQL {
  id?: string,
  full_name?: string,
  status?: string,
  company_id?: string,
}

export const mapAppUserSQLToAppUser = (sqlData?: AppUserSQL): AppUser => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    fullName: sqlData.full_name,
    companyId: sqlData.company_id,
    status: sqlData.status
  };
};

export interface AppUserResponse {
  user: AppUserSQL | null;
}