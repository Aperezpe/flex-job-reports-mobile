import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, CheckBox, Image, Text } from '@rneui/themed';
import { supabase } from '../../utils/supabase';
import { User } from '@supabase/supabase-js';
import { AppColors } from '../../constants/AppColors';
import { globalStyles } from '../../constants/GlobalStyles';
import TextLink from './shared/TextLink';
import { TechnicianForm } from './types/TechnicianForm';
import { CompanyAdminForm } from './types/CompanyAdminForm';
import { LoginForm } from './types/LoginForm';
import LoginFormView from './shared/LoginFormView';
import RegisterFormView from './shared/RegisterFormView';
import { RegisterForm } from './types/RegisterForm';
import { APP_ICON } from '../../index';

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
  // const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  // const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [checked, setChecked] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({});
  // const [companyAdminForm, setCompanyAdminForm] = useState<CompanyAdminForm>({});
  // const [technicianForm, setTechnicianForm] = useState<TechnicianForm>({});
  const [registerForm, setRegisterForm] = useState<RegisterForm>({});

  useEffect(() => {
    if (showLogin) setChecked(false);
  }, [showLogin]);

  async function loginWithEmail() {
    // TODO: Validate loginForm. If email or password is empty, do something
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email!,
      password: loginForm.password!,
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

    // TODO: Validate form
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: registerForm.email!,
      password: registerForm.password!,
    });

    if (session) {
      upsertNewUser(session.user);
    }

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  const toggleShowLogin = () => setShowLogin(!showLogin);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
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

        {showLogin ? (
          <LoginFormView loginForm={loginForm} setForm={setLoginForm} />
        ) : (
          <RegisterFormView registerForm={registerForm} setForm={setRegisterForm} />
        )}

        <View style={styles.footer}>
          <View style={styles.loginOrRegisterContainer}>
            <Text style={[globalStyles.textRegular, styles.text]}>
              {showLogin ? `Don't have an account yet?` : `Already have an account?`}
              {'  '}
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
            titleStyle={globalStyles.textSubtitle}
            disabled={showLogin ? false : !checked}
          >
            {showLogin ? 'Login' : 'Register'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 40,
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
});
