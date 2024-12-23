import { Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import { SupabaseRESTProvider } from "../../context/SupabaseREST.ctx";
import { Provider } from "react-redux";
import { store } from "../../store";

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
  const { session, isLoading } = useSupabaseAuth();

  if (isLoading) {
    console.log('AppLayout: isLoading?')
    return <Text>Loading...</Text>;
  }

  if (!session) {
    console.log('AppLayout: !session?')
    return <Redirect href="/(public)/login" />;
  }

  console.log('AppLayout')

  return (
    <Provider store={store}>
      <SupabaseRESTProvider>
        <Slot />
      </SupabaseRESTProvider>
    </Provider>
  );
}
