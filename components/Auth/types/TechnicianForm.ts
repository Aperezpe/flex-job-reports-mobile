import { LoginForm } from "./LoginForm";

export interface TechnicianForm extends LoginForm {
  fullName?: string,
  retypePassword?: string,
  phoneNumber?: string,
  companyId?: string
}