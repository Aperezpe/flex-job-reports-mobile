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
  SafeAreaView,
} from 'react-native';
import { Button, CheckBox, Image, Text } from '@rneui/themed';
import { supabase } from '../../config/supabase';
import { AppColors } from '../../constants/AppColors';
import { globalStyles } from '../../constants/GlobalStyles';
import { APP_ICON } from '../../index';
import { useAuthScreenContext } from '../../context/AuthScreen.ctx';
import { RegisterTabs } from '../../types/Auth/RegisterTabs';
import LoginFormView from './shared/LoginFormView';
import RegisterFormView from './shared/RegisterFormView';
import TextLink from './shared/TextLink';
import { useSupabaseAuth } from '../../context/SupabaseAuth.ctx';
import { useSupabaseREST } from '../../context/SupabaseREST.ctx';
import { PGRST116 } from '../../constants/ErrorCodes';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import { setInsertingAuthData } from '../../slices/registration.slice';

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

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const {
    formState,
    selectedTab,
    showLogin,
    setShowLogin,
    setFormSubmitted,
    resetForm,
    onSubmit,
    prefillCompanyAdminFormMock,
  } = useAuthScreenContext();

  const { signInWithPassword, signUp } = useSupabaseAuth();
  const { getCompanyUID, insertCompany, updateUser } = useSupabaseREST();
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    setFormSubmitted(false);
    setChecked(false);
    resetForm();
  }, [showLogin, selectedTab]);

  const companyIDExists = async (inputCompanyID: string) => {
    const {
      data: { companyUID },
      error,
    } = await getCompanyUID(inputCompanyID);
    if (companyUID) return { companyUID, companyIDError: null };
    else return { companyUID: null, companyIDError: error };
  };

  async function onSubmitLogin() {
    setLoading(true);
    try {
      await signInWithPassword(formState.values.email!, formState.values.password!);
    } catch (err: Error | any) {
      Alert.alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitRegisterCompanyAdmin() {
    setLoading(true);
    try {
      const { companyUID, companyIDError } = await companyIDExists(
        formState.values.companyId!
      );

      if (companyUID) {
        Alert.alert(
          'Company ID already exists',
          'Please create a different company UID'
        );
        return;
      }

      if (companyIDError && companyIDError.code !== PGRST116) throw companyIDError;

      const authResponse = await signUp(
        formState.values.email!,
        formState.values.password!
      );

      if (authResponse.error) throw authResponse.error;
      if (!authResponse.data.user) throw Error('Error fetching the user');
      dispatch(setInsertingAuthData(true))  
    
      const { company } = await insertCompany({
        company_name: formState.values.companyName,
        company_address: formState.values.companyAddress,
        phone_number: formState.values.phoneNumber,
        company_uid: formState.values.companyId,
        admin_id: authResponse.data.user.id, // Links admin ID to company
      });

      if (!company) throw 'Unexpected error fetching company';

      await updateUser({
        id: authResponse.data.user.id,
        company_id: company.id,
        full_name: formState.values.fullName,
        status: 'ADMIN'
      });
    } catch (error: any) {
      console.log(error);
      Alert.alert(error.message);
    } finally {
      dispatch(setInsertingAuthData(false))  
      setLoading(false);
    }
  }

  async function onSubmitRegisterTechnician() {
    console.log('Technician registration');
  }

  const handleSubmit = () => {
    if (showLogin) onSubmit(onSubmitLogin);
    else if (selectedTab === RegisterTabs.TECHNICIAN)
      onSubmit(onSubmitRegisterTechnician);
    else onSubmit(onSubmitRegisterCompanyAdmin);
  };

  const toggleShowLogin = () => setShowLogin(!showLogin);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView>
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
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

          {showLogin ? <LoginFormView loading={loading} /> : <RegisterFormView />}
          <Button onPress={prefillCompanyAdminFormMock}>
            Prefill Company Admin
          </Button>

          <View style={styles.footer}>
            <View style={styles.loginOrRegisterContainer}>
              <Text style={[globalStyles.textRegular, styles.text]}>
                {showLogin
                  ? `Don't have an account yet?`
                  : `Already have an account?`}
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
              disabled={showLogin || loading ? false : !checked}
              onPress={handleSubmit}
            >
              {loading && <ActivityIndicator size='small' />}
              {showLogin && !loading ? 'Login' : 'Register'}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
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
    marginBottom: 45,
  },
});
