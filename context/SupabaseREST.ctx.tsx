import { createContext, useContext } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../config/supabase';
import { AppUserResponse, UserSQL } from '../types/Auth/AppUser';
import { useSupabaseAuth } from './SupabaseAuth.ctx';
import {
  CompanyResponse,
  CompanySQL,
  CompanyUIDResponse,
} from '../types/Company';
import { AppDispatch } from '../store';
import { useDispatch } from 'react-redux';
import { setAppUser } from '../slices/appUser.slice';
import { setAppCompany } from '../slices/appCompany.slice';

SplashScreen.preventAutoHideAsync();

type SupabaseRESTContextProps = {
  getCompanyUID: (companyUID: string) => Promise<CompanyUIDResponse>;
  insertCompany: (companyData: CompanySQL) => Promise<CompanyResponse>;
  updateUser: (userData: UserSQL) => Promise<AppUserResponse>;
};

type SupabaseRESTProviderProps = {
  children: React.ReactNode;
};

export const SupabaseRESTContext = createContext<SupabaseRESTContextProps>({
  getCompanyUID: async () => ({ data: { companyUID: '' }, error: null }),
  insertCompany: async () => ({ company: {} }),
  updateUser: async () => ({ user: { id: '' } }),
});

export const useSupabaseREST = () => useContext(SupabaseRESTContext);

export const SupabaseRESTProvider = ({ children }: SupabaseRESTProviderProps) => {
  // REST has Auth context
  const { authUser } = useSupabaseAuth();
  const dispatch = useDispatch<AppDispatch>();

  const getCompanyUID = async (companyUID: string): Promise<CompanyUIDResponse> => {
    const { data, error } = await supabase
      .from('companies')
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

  const fetchUser = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, company_id, status')
      .eq('id', authUser?.id)
      .single();
    if (error) throw error;
    if (data)
      dispatch(
        setAppUser({
          id: data.id,
          fullName: data.full_name,
          companyId: data.company_id,
          status: data.status,
        })
      );
  };

  const fetchCompany = async (): Promise<void> => {
    const { data, error } = await supabase
      .from('companies')
      .select(
        'id, company_name, company_address, phone_number, system_types, admin_id, forms, company_uid'
      )
      .eq('id', authUser?.id)
      .single();
    if (error) throw error;
    if (data)
      dispatch(
        setAppCompany({
          id: data.id,
          companyName: data.company_name,
          companyAddress: data.company_address,
          companyUID: data.company_uid,
          adminId: data.admin_id,
          companyPhone: data.phone_number,
          forms: data.forms,
          systemTypes: data.system_types,
        })
      );
  };

  const insertCompany = async (
    companyData: CompanySQL
  ): Promise<CompanyResponse> => {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        company_name: companyData.company_name,
        company_address: companyData.company_address,
        phone_number: companyData.phone_number,
        company_uid: companyData.company_uid,
        admin_id: companyData.admin_id, // Links admin ID to company
      } as CompanySQL)
      .select('*')
      .single();

    // Throw error to prevent insertin undefined values to appCompany
    if (error) throw error;
    if (!data) throw Error('There was an error inserting the company');

    dispatch(
      setAppCompany({
        id: data.id,
        adminId: data.admin_id,
        companyName: data.company_name,
        companyAddress: data.company_address,
        companyPhone: data.company_phone,
        companyUID: data.company_uid,
      })
    );

    return { company: data };
  };

  const updateUser = async (userData: UserSQL): Promise<AppUserResponse> => {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: userData.full_name,
        status: userData.status,
        company_id: userData.company_id, // Links company ID to user
      } as UserSQL)
      .eq('id', userData.id)
      .select('*')
      .single();

    // Throw error to prevent inserting undefined values to appCompany
    if (error) throw error;
    if (!data) throw Error('No user found! :(');

    dispatch(
      setAppUser({
        id: data.id,
        fullName: data.full_name,
        status: data.status,
        companyId: data.company_id,
      })
    );

    return { user: data };
  };

  return (
    <SupabaseRESTContext.Provider
      value={{
        getCompanyUID,
        insertCompany,
        updateUser,
      }}
    >
      {children}
    </SupabaseRESTContext.Provider>
  );
};
