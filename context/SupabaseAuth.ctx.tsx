import { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../config/supabase';
import { SignUpCompanyAdmin } from '../types/Auth/SignUpCompanyAdmin';

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
  authUser: User | null;
  session: Session | null;
  authenticated?: boolean;
  signUp: (credentials: SignUpCompanyAdmin) => Promise<AuthResponse>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  authUser: null,
  session: null,
  authenticated: false,
  signUp: async () => ({
    data: { user: null, session: null },
    error: null,
  }),
  signInWithPassword: async () => {},
  signOut: async () => {},
});

export const useSupabaseAuth = () => useContext(SupabaseContext);

export const SupabaseAuthProvider = ({ children }: SupabaseProviderProps) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  // Auth does NOT have context of REST
  // const { getCompanyUID } = useSupabaseREST(); // WRONG

  const signUp = async ({
    email,
    password,
    data,
  }: SignUpCompanyAdmin): Promise<AuthResponse> => {
    console.log("Sign up:", email, password, data)
    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: { data },
      });
    } catch (error: AuthError | any) {
      console.log(error);
      return { data: { user: null, session: null }, error };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session ? session.user : null);
      setAuthenticated(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthUser(session ? session.user : null);
    });
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        authUser,
        session,
        authenticated,
        signUp,
        signInWithPassword,
        signOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
