import { Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import {
  SupabaseRESTProvider,
  useSupabaseREST,
} from "../../context/SupabaseREST.ctx";
import { useEffect } from "react";
import useAsync from "../../hooks/useAsyncCallback";
import { mapUserSQLToAppUser } from "../../types/Auth/AppUser";
import { mapCompanySQLToCompany } from "../../types/Company";
import useCompanyAndUserStorage from "../../hooks/useCompanyAndUserStorage";

/**
 * AppLayout serves as the root authentication wrapper for the main app routes.
 * It ensures:
 * 1. Protected routes are only accessible to authenticated users
 * 2. Loading states are handled appropriately
 * 3. Unauthenticated users are redirected to sign-in
 *
 * This layout wraps all routes within the (app) directory, but not (auth) routes,
 * allowing authentication flows to remain accessible.
 */
export default function AppLayout() {
  const { session, isLoading, authUser } = useSupabaseAuth();
  const { fetchUserWithCompany } = useSupabaseREST();
  const { setCompanyAndUserToStorage } = useCompanyAndUserStorage()

  const { loading, asyncWrapper } = useAsync();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  // Here setup appCompany and appUser on async storage
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      asyncWrapper(async () => {
        const { data: userWithCompany, error } = await fetchUserWithCompany(
          userId
        );
        if (error) throw error;

        if (userWithCompany && userWithCompany.company) {
          const user = {
            ...mapUserSQLToAppUser(userWithCompany),
            companyId: userWithCompany.company.id,
          };
          const company = mapCompanySQLToCompany(userWithCompany.company);

          setCompanyAndUserToStorage(company, user)
        }
      });
    };

    if (authUser) {
      fetchUserData(authUser.id);
    }
  }, [authUser]);

  return (
    // <Provider store={store}>
      <SupabaseRESTProvider>
        <Slot />
      </SupabaseRESTProvider>
    // </Provider>
  );
}
