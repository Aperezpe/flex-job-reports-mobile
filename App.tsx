import { useState, useEffect } from 'react';
import Auth from './components/Auth/Auth';
import Account from './components/Account';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './config/supabase';
import { useFonts } from 'expo-font';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Monda_700Bold } from '@expo-google-fonts/monda';
import {
  HindVadodara_400Regular,
  HindVadodara_700Bold,
} from '@expo-google-fonts/hind-vadodara';
import { AppColors } from './constants/AppColors';
import { AuthProvider } from './context/Auth.ctx';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    Montserrat_700Bold,
    Monda_700Bold,
    HindVadodara_400Regular,
    HindVadodara_700Bold,
  });
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.appContainer}>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <AuthProvider>
          <Auth />
        </AuthProvider>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: AppColors.whitePrimary,
  },
});
