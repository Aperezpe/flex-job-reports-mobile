import { Alert } from "react-native";
import { LoginForm } from "../components/Auth/types/LoginForm"
import { RegisterForm } from "../components/Auth/types/RegisterForm"
import { supabase } from "../config/supabase";

export const logInUser = async (loginForm: LoginForm) => {
  await supabase.auth.signInWithPassword({
    email: loginForm.email!,
    password: loginForm.password!,
  });
}

const companyIdExists = (companyId: string) => {

}

export const registerCompanyAdmin = async (registerForm: RegisterForm) => {

  // Check if company ID exists. If so, prompt user to choose different company ID
  // if (companyIdExists(registerForm.companyId))

  // const {
  //   data: { session },
  //   error,
  // } = await supabase.auth.signUp({
  //   email: registerForm.email!,
  //   password: registerForm.password!,
  // });



  
}

export const registerTechnician = async (registerForm: RegisterForm) => {

}