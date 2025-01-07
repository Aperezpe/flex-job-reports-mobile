import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "../config/supabase";
import { Company, mapCompanySQLToCompany } from "../types/Company";
import { AppUser, mapUserSQLToAppUser } from "../types/Auth/AppUser";
import { UserAndCompanySQL } from "../types/Auth/SignUpCompanyAdmin";
import { useSupabaseAuth } from "./SupabaseAuth.ctx";
import useAsyncLoading from "../hooks/useAsyncLoading";

// Define the context type
interface CompanyAndUserContextType {
  appCompany: Company | null;
  appUser: AppUser | null;
  loading: boolean;
  setCompanyAndUserToState: (authUserId: string) => Promise<void>;
  clearCompanyAndUserFromState: () => void;
}

// Create the context
const CompanyAndUserContext = createContext<
  CompanyAndUserContextType | undefined
>(undefined);

// Provider component
export const CompanyAndUserProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [appCompany, setAppCompany] = useState<Company | null>(null);
  const { loading, callWithLoading } = useAsyncLoading();
  const { authUser } = useSupabaseAuth();
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  // Set company and user to state
  const setCompanyAndUserToState = useCallback(async (authUserId: string) => {
    callWithLoading(async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*, companies!users_company_id_fkey(*)")
          .eq("id", authUserId)
          .single();

        if (error) throw error;

        const userWithCompany: UserAndCompanySQL = {
          ...data,
          company: data?.companies,
        };

        const user = {
          ...mapUserSQLToAppUser(userWithCompany),
          companyId: userWithCompany?.company?.id,
        };
        const company = mapCompanySQLToCompany(userWithCompany?.company);

        setAppCompany(company);
        setAppUser(user);

        console.log("Company and User set to state");
      } catch (error) {
        console.error("Error setting company and user to state:", error);
      }
    });
  }, []);

  // Clear company and user from state
  const clearCompanyAndUserFromState = useCallback(() => {
    setAppCompany(null);
    setAppUser(null);
    console.log("Company and User cleared from state");
  }, []);

  // Setup appCompany and appUser on async storage
  useEffect(() => {
    if (authUser) setCompanyAndUserToState(authUser.id);
  }, [authUser]);

  return (
    <CompanyAndUserContext.Provider
      value={{
        appCompany,
        appUser,
        loading,
        setCompanyAndUserToState,
        clearCompanyAndUserFromState,
      }}
    >
      {children}
    </CompanyAndUserContext.Provider>
  );
};

// Custom hook to use the context
export const useCompanyAndUser = (): CompanyAndUserContextType => {
  const context = useContext(CompanyAndUserContext);
  if (!context) {
    throw new Error(
      "useCompanyAndUser must be used within a CompanyAndUserProvider"
    );
  }
  return context;
};
