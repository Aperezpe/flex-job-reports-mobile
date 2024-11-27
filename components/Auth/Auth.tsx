import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  ActivityIndicator,
} from 'react-native';
import { Button, CheckBox, Image, Text } from '@rneui/themed';
import { supabase } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';
import { APP_ICON } from '../..';
import { AppColors } from '../../constants/AppColors';
import { globalStyles } from '../../constants/GlobalStyles';
import TextLink from './shared/TextLink';
import { TechnicianForm } from './types/TechnicianForm';
import { CompanyAdminForm } from './types/CompanyAdminForm';
import { LoginForm } from './types/LoginForm';
import LoginFormView from './shared/LoginFormView';
import RegisterFormView from './shared/RegisterFormView';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});


export default function Auth() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [checked, setChecked] = useState(false);
  const [form, setForm] = useState<LoginForm | TechnicianForm | CompanyAdminForm>({
    email: "",
    password: ""
  })

  useEffect(() => {
    if (showLogin) setChecked(false);
  }, [showLogin])

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function upsertNewUser(user: User) {
    const { data, error } = await supabase
      .from('users')
      .upsert([
        {
          full_name: fullName,
          status: '', // ADMIN when creating company, PENDING when trying to join company
          // company_id: companyId // First create company, then get companyId
        },
      ])
      .eq('id', user.id);

    if (error) Alert.alert('Error upserting user:', error.message);
    else console.log('Upserted data:', data);
  }

  async function registerCompanyAdmin() {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (session) {
      upsertNewUser(session.user);
    }

    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    // If technician, get the company he's trying to sign up to, if nothing, return Alert saying that there was an error
    // Get Company

    // If company admin, continue flow
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // If
    if (session) {
      upsertNewUser(session.user);
    }

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  const toggleShowLogin = () => setShowLogin(!showLogin);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={APP_ICON}
          style={styles.appIcon}
          resizeMethod='scale'
          PlaceholderContent={<ActivityIndicator />}
        />
        <Text h2 h2Style={styles.appTitle}>
          FlexJobReports
        </Text>
      </View>

      {showLogin ? <LoginFormView /> : <RegisterFormView />}

      <View style={styles.footer}>

          <View style={styles.loginOrRegisterContainer}>
            <Text style={[globalStyles.textRegular, styles.text]}>
              {showLogin ? `Don't have an account yet?` : `Already have an account?`}{'  '}
            </Text>
            <TextLink onPress={toggleShowLogin}>
              {showLogin ? 'Register' : 'Login'}
            </TextLink>
          </View>

        {!showLogin && (
          <CheckBox
            title={
              <View style={styles.termsAndConditionsContainer}>
                <Text style={[globalStyles.textRegular, styles.text]}>
                  I agree to the{'  '}
                </Text>
                <TextLink onPress={() => {}}>Terms & Conditions</TextLink>
              </View>
            }
            checked={checked}
            containerStyle={styles.checkboxContainer}
            onPress={() => setChecked(!checked)}
          ></CheckBox>
        )}
        <Button
          containerStyle={styles.buttonContainerStyle}
          buttonStyle={styles.buttonStyle}
          titleStyle={styles.buttonTitleStyle}
          disabled={showLogin ? false : !checked}
        >
          {showLogin ? 'Login' : 'Register'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 25,
  },
  header: {
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 15,
  },
  appIcon: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  appTitle: {
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  content: {
    backgroundColor: 'orange',
    height: 50,
  },
  footer: {
    gap: 10,
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: AppColors.darkBluePrimary,
  },
  // Login or Register styles
  loginOrRegisterContainer: {
    flexDirection: 'row',
  },
  // Checkbox styles
  checkboxContainer: { padding: 0 },
  termsAndConditionsContainer: {
    flexDirection: 'row',
  },
  // Bottom Button styles
  buttonContainerStyle: {
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: AppColors.darkBluePrimary,
    borderRadius: 8,
  },
  buttonTitleStyle: {
    fontSize: 20,
    fontFamily: 'Monda_700Bold',
  },
});
