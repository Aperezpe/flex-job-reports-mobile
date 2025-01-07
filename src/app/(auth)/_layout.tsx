import { Redirect, Slot } from "expo-router";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import { CompanyAndUserProvider } from "../../context/CompanyAndUser.ctx";

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
  const { session } = useSupabaseAuth();

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <CompanyAndUserProvider>
      <Slot />
    </CompanyAndUserProvider>
);
}