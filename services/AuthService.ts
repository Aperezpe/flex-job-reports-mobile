import { Alert } from "react-native";
import { AuthForm } from "../types/Auth/AuthForm"
import { supabase } from "../config/supabase";

export const logInUser = async (loginForm: AuthForm) => {
  await supabase.auth.signInWithPassword({
    email: loginForm.email!,
    password: loginForm.password!,
  });
}

const companyIdExists = (companyId: string) => {

}

export const registerCompanyAdmin = async (registerForm: AuthForm) => {

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

export const registerTechnician = async (registerForm: AuthForm) => {

}