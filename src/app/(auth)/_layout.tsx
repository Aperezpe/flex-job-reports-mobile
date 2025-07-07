import { Redirect, Stack } from "expo-router";
import React from "react";
import { makeStyles } from "@rneui/themed";
import { useSupabaseAuth } from "../../context/SupabaseAuthContext";

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
  const styles = useStyles();
  const { session } = useSupabaseAuth();
  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.content,
      }}
    >
      <Stack.Screen
        name="modal/report"
        getId={({ params }) => params?.systemId?.toString()}
        options={({ route }) => {
          const params = route.params as {
            systemId: string;
            presentationType?:
              | "modal"
              | "transparentModal"
              | "containedModal"
              | "containedTransparentModal"
              | "fullScreenModal"
              | "formSheet"
              | "card"
              | undefined;
          };

          return {
            headerShown: true,
            presentation: params.presentationType,
            headerBackButtonMenuEnabled: true,
            headerBackButtonDisplayMode: "minimal",
          };
        }}
      />
    </Stack>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.white,
  },
  title: {
    color: theme.colors.black,
  },
}));
