import { useState, useEffect } from 'react';
import ClientsScreen from './components/ClientsScreen';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './config/supabase';
import { useFonts } from 'expo-font';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Monda_700Bold } from '@expo-google-fonts/monda';
import {
  HindVadodara_400Regular,
  HindVadodara_700Bold,
} from '@expo-google-fonts/hind-vadodara';
import { AppColors } from './constants/AppColors';
import { AuthScreenProvider } from './context/AuthScreen.ctx';
import AuthScreen from './components/AuthScreen';
import { SupabaseProvider, useSupabaseAuth } from './context/SupabaseAuth.ctx';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    Montserrat_700Bold,
    Monda_700Bold,
    HindVadodara_400Regular,
    HindVadodara_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {}, []);

  return <SupabaseProvider>
    <LandingPage />
  </SupabaseProvider>;
}

const LandingPage = () => {
  const { session, user } = useSupabaseAuth();

  return (
    <View style={styles.appContainer}>
      {session && user ? (
        <ClientsScreen key={user.id} session={session} />
      ) : (
        <AuthScreenProvider>
          <AuthScreen />
        </AuthScreenProvider>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: AppColors.whitePrimary,
  },
});
