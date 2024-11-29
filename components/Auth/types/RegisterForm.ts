import { LoginForm } from "./LoginForm";

export interface RegisterForm extends LoginForm {
  fullName?: string,
  retypePassword?: string,
  phoneNumber?: string,
  companyId?: string
  companyName?: string,
  companyAddress?: string,
  companyPhone?: string,
} 