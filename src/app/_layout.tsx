import React, { useEffect, useLayoutEffect } from "react";
import { Slot, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { Monda_700Bold } from "@expo-google-fonts/monda";
import {
  HindVadodara_400Regular,
  HindVadodara_700Bold,
  HindVadodara_600SemiBold,
} from "@expo-google-fonts/hind-vadodara";
import { SupabaseAuthProvider } from "../context/SupabaseAuthContext";
import { AppState, useColorScheme } from "react-native";
import { supabase } from "../config/supabase";
import { createTheme, ThemeProvider } from "@rneui/themed";
import { darkColors, lightColors } from "../constants/theme";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "login",
};

const RootLayout = () => {
  const [loaded, error] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Monda_700Bold,
    HindVadodara_400Regular,
    HindVadodara_700Bold,
    HindVadodara_600SemiBold,
  });

  const colorScheme = useColorScheme();

  const theme = createTheme({
    lightColors,
    darkColors,
    mode: colorScheme ?? 'light',
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useLayoutEffect(() => {
    if (loaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 300); // HACK: Para que no se enseñe una pantalla por unos milisegundos antes de que la secion se cargue
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <SupabaseAuthProvider>
        <Slot />
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
