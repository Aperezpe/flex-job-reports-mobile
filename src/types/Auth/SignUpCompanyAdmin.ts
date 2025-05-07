import { CompanySQL } from "../Company"

export type SignUpCompanyAdmin = {
  email: string
  password: string
  data?: object
}

export type UserAndCompanySQL = {
  id?: string,
  full_name?: string,
  status?: string,
  company?: CompanySQL
}