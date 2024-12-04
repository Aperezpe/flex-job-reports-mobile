import { useEffect } from 'react';
import ClientsScreen from './components/ClientsScreen';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuth.ctx';
import { SupabaseRESTProvider } from './context/SupabaseREST.ctx';
import { Provider } from 'react-redux';
import { store } from './store';

SplashScreen.preventAutoHideAsync();

const LandingPage = () => {
  const [loaded, error] = useFonts({
    Montserrat_700Bold,
    Monda_700Bold,
    HindVadodara_400Regular,
    HindVadodara_700Bold,
  });

  const { session, authUser, authenticated } = useSupabaseAuth();

  useEffect(() => {
    /* HACK: Something must be rendered when determining the initial auth state... 
		instead of creating a loading screen, we use the SplashScreen and hide it after
		it has been initialized
		*/
    if (authenticated && (loaded || error)) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, authenticated]);

  return (
    <View style={styles.appContainer}>
      {session && authUser ? (
        <ClientsScreen key={authUser.id} session={session} />
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

export default function App() {
  return (
    <Provider store={store}>
      <SupabaseAuthProvider>
        <SupabaseRESTProvider>
          <LandingPage />
        </SupabaseRESTProvider>
      </SupabaseAuthProvider>
    </Provider>
  );
}
