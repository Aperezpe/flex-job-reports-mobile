export interface AppUser {
  id?: string,
  fullName?: string,
  status?: string,
  companyId?: string
}

export interface UserSQL {
  id?: string,
  full_name?: string,
  status?: string,
  company_id?: string,
}

export const mapUserSQLToAppUser = (sqlData?: UserSQL): AppUser => {
  if (!sqlData) return {};
  return {
    id: sqlData.id,
    fullName: sqlData.full_name,
    companyId: sqlData.company_id,
    status: sqlData.status
  };
};

export interface AppUserResponse {
  user: UserSQL | null;
}