import { RegisterForm } from "./RegisterForm";

export interface CompanyAdminForm extends RegisterForm {
  companyName: string,
  companyAddress?: string,
  companyPhone?: string,
}