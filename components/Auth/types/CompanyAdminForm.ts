import { LoginForm } from "./LoginForm";

export interface CompanyAdminForm extends LoginForm {
  fullName?: string,
  retypePassword?: string,
  phoneNumber?: string,
  companyName?: string,
  companyAddress?: string,
  companyPhone?: string,
}