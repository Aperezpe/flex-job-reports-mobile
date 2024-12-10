import { createContext, useContext } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../config/supabase';
import { CompanyUIDResponse } from '../types/Company';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { UserAndCompanySQL } from '../types/Auth/SignUpCompanyAdmin';

SplashScreen.preventAutoHideAsync();

type SupabaseRESTContextProps = {
  getCompanyUID: (companyUID: string) => Promise<CompanyUIDResponse>;
  fetchUserWithCompany: (
    userId: string
  ) => Promise<PostgrestSingleResponse<UserAndCompanySQL>>;
};

type SupabaseRESTProviderProps = {
  children: React.ReactNode;
};

export const SupabaseRESTContext = createContext<SupabaseRESTContextProps>({
  getCompanyUID: async () => ({ data: { companyUID: '' }, error: null }),
  fetchUserWithCompany: async () => ({
    error: null,
    data: {},
    count: null,
    status: 204,
    statusText: 'OK',
  }),
});

export const useSupabaseREST = () => useContext(SupabaseRESTContext);

export const SupabaseRESTProvider = ({ children }: SupabaseRESTProviderProps) => {

  const getCompanyUID = async (companyUID: string): Promise<CompanyUIDResponse> => {
    const { data, error } = await supabase
      .from('company_uids')
      .select('company_uid')
      .eq('company_uid', companyUID)
      .single();

    return {
      data: {
        companyUID: data?.company_uid,
      },
      error,
    };
  };

  const fetchUserWithCompany = async (
    userId: string
  ): Promise<PostgrestSingleResponse<UserAndCompanySQL>> => {
    const { data, error, status, statusText } = await supabase
      .from('users')
      .select(
        `
      *,
      companies!users_company_id_fkey(*)
    `
      )
      .eq('id', userId) // Only fetch the current user
      .single(); // Ensure only one row is returned for the user

    if (error) {
      return { error, data: null, count: null, status, statusText };
    }

    // If companies is an array (should contain one element), access the first element
    const userWithCompany: UserAndCompanySQL = {
      ...data,
      company: data?.companies, // Access the first company if present, or set an empty object
    };

    return {
      error: null,
      data: userWithCompany,
      count: 1,
      status,
      statusText,
    };
  };


  return (
    <SupabaseRESTContext.Provider
      value={{
        getCompanyUID,
        fetchUserWithCompany,
      }}
    >
      {children}
    </SupabaseRESTContext.Provider>
  );
};


// Custom hook to use SupabaseRESTContext
export const useSupabaseRESTContext = () => {
  const context = useContext(SupabaseRESTContext);
  if (!context)
    throw new Error('useSupabaseREST must be used within a SupabaseRESTProvider');
  return context;
};
