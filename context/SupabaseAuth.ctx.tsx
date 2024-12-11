import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  User,
} from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "../config/supabase";
import { SignUpCompanyAdmin } from "../types/Auth/SignUpCompanyAdmin";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

type SupabaseAuthContextProps = {
  authUser: User | null;
  session: Session | null;
  signUp: (credentials: SignUpCompanyAdmin) => Promise<AuthResponse>;
  signIn: (
    email: string,
    password: string
  ) => Promise<AuthTokenResponsePassword>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseAuthContext = createContext<SupabaseAuthContextProps>({
  authUser: null,
  session: null,
  signUp: async () => ({
    data: { user: null, session: null },
    error: null,
  }),
  signIn: async () => ({
    data: { user: null, session: null, weakPassword: null },
    error: new AuthError('Unable to SignIn'),
  }),
  signOut: async () => {},
  isLoading: false,
});

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export const SupabaseAuthProvider = ({ children }: SupabaseProviderProps) => {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async ({
    email,
    password,
    data,
  }: SignUpCompanyAdmin): Promise<AuthResponse> => {
    console.log("Sign up:", email, password, data);
    setIsLoading(true);
    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: { data },
      });
    } catch (error: AuthError | any) {
      console.log(error);
      return { data: { user: null, session: null }, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthTokenResponsePassword> => {
    setIsLoading(true);
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (error: any) {
      console.log(error);
      return { data: { user: null, session: null }, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoading(true);
      setSession(session);
      setAuthUser(session ? session.user : null);
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthUser(session ? session.user : null);
      setIsLoading(false);
      router.replace("/(auth)");
    });
  }, []);

  return (
    <SupabaseAuthContext.Provider
      value={{
        authUser,
        session,
        signUp,
        signIn,
        signOut,
        isLoading,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Custom hook to use SupabaseAuthContext
export const useSupabaseAuthContext = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context)
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  return context;
};
