export interface AppUser {
  id: string,
  fullName: string,
  status?: string,
  companyId?: string
}

export interface UserSQL {
  id?: string,
  full_name?: string,
  status?: string,
  company_id?: string,
}

export interface AppUserResponse {
  user: UserSQL | null;
}