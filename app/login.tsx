import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Button, CheckBox, Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseAuth } from "../context/SupabaseAuth.ctx";
import { AuthScreenProvider, useAuthScreenContext } from "../context/AuthScreen.ctx";
import { useSupabaseREST } from "../context/SupabaseREST.ctx";
import { AuthError } from "@supabase/supabase-js";
import { PGRST116 } from "../constants/ErrorCodes";
import { ADMIN, PENDING } from "../constants";
import { RegisterTabs } from "../types/Auth/RegisterTabs";
import LoginFormView from "../components/AuthScreen/shared/LoginFormView";
import RegisterFormView from "../components/AuthScreen/shared/RegisterFormView";
import { globalStyles } from "../constants/GlobalStyles";
import TextLink from "../components/AuthScreen/shared/TextLink";
import { AppColors } from "../constants/AppColors";
import { Image } from "expo-image";

type Props = {};

const AuthScreen = (props: Props) => {
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

  const { signInWithPassword, signUp, session } = useSupabaseAuth();
  const { getCompanyUID } = useSupabaseREST();
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);

  useEffect(() => {
    setFormSubmitted(false);
    setChecked(false);
    resetForm();
  }, [showLogin, selectedTab]);

  async function onSubmitLogin() {
    setLoading(true);
    try {
      await signInWithPassword(
        formState.values.email!,
        formState.values.password!
      );
    } catch (err: AuthError | any) {
      console.log(JSON.stringify(err));
      Alert.alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const companyIDExists = async (inputCompanyID: string) => {
    const {
      data: { companyUID },
      error,
    } = await getCompanyUID(inputCompanyID);
    if (companyUID) return { exists: true, companyIDError: null };
    else return { exists: false, companyIDError: error };
  };

  async function onSubmitRegister({ isAdmin }: { isAdmin: boolean }) {
    setLoading(true);
    try {
      const { exists, companyIDError } = await companyIDExists(
        formState.values.companyId!
      );

      // Don't proceed if Company Admin typed an existing Company ID
      if (exists && isAdmin) throw Error("Company ID already exists");
      // PGRST116 | 406 | More than 1 or no items where returned when requesting a singular response
      // (https://docs.postgrest.org/en/v12/references/errors.html)
      if (companyIDError && companyIDError.code === PGRST116 && !isAdmin)
        throw Error("Company ID not found");

      // TODO: Fix trigger for technician

      const { error } = await signUp({
        email: formState.values.email!,
        password: formState.values.password!,
        data: {
          fullName: formState.values.fullName,
          phoneNumber: formState.values.phoneNumber,
          companyUID: formState.values.companyId,
          companyName: formState.values.companyName,
          status: isAdmin ? ADMIN : PENDING,
        },
      });

      if (error) Alert.alert(error.message);
    } catch (error: any) {
      console.log(error);
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = () => {
    if (showLogin) onSubmit(onSubmitLogin);
    else if (selectedTab === RegisterTabs.TECHNICIAN)
      onSubmit(() => onSubmitRegister({ isAdmin: false }));
    else onSubmit(() => onSubmitRegister({ isAdmin: true }));
  };

  const toggleShowLogin = () => setShowLogin(!showLogin);

  useEffect(() => {
    setDisableSubmitButton(false);
    if (!showLogin && !checked) setDisableSubmitButton(true);
    if (loading) setDisableSubmitButton(true);
  }, [showLogin, loading, checked]);

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={
                "https://www.logoai.com/oss/icons/2021/10/27/rA73APprj8wskQ0.png"
              }
              style={styles.appIcon}
              placeholder={{ blurhash }}
              contentFit="contain"
              transition={1000}
            />

            <Text h2 h2Style={styles.appTitle}>
              FlexJobReports
            </Text>
          </View>

          {showLogin ? (
            <LoginFormView loading={loading} />
          ) : (
            <RegisterFormView />
          )}
          <Button onPress={prefillCompanyAdminFormMock}>
            Prefill Company Admin
          </Button>

          <View style={styles.footer}>
            <View style={styles.loginOrRegisterContainer}>
              <Text style={[globalStyles.textRegular, styles.text]}>
                {showLogin
                  ? `Don't have an account yet?`
                  : `Already have an account?`}
                {"  "}
              </Text>
              <TextLink onPress={toggleShowLogin}>
                {showLogin ? "Register" : "Login"}
                {/* <Link href={showLogin ? 'register' : 'login'} /> */}
              </TextLink>
            </View>

            {!showLogin && (
              <CheckBox
                title={
                  <View style={styles.termsAndConditionsContainer}>
                    <Text style={[globalStyles.textRegular, styles.text]}>
                      I agree to the{"  "}
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
              titleStyle={[globalStyles.textSubtitle, styles.buttonTitleStyle]}
              disabled={disableSubmitButton}
              onPress={handleSubmit}
            >
              {loading && (
                <ActivityIndicator
                  size="small"
                  color={AppColors.darkBluePrimary}
                />
              )}
              {showLogin ? "Login" : "Register"}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const AuthScreenState = () => {
  return <AuthScreenProvider>
    <AuthScreen />
  </AuthScreenProvider>
}

export default AuthScreenState;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  header: {
    justifyContent: "center",
    paddingVertical: 50,
    gap: 15,
  },
  appIcon: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  appTitle: {
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
  content: {
    backgroundColor: "orange",
    height: 50,
  },
  footer: {
    gap: 10,
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
  // Login or Register styles
  loginOrRegisterContainer: {
    flexDirection: "row",
  },
  // Checkbox styles
  checkboxContainer: { padding: 0 },
  termsAndConditionsContainer: {
    flexDirection: "row",
  },
  // Bottom Button styles
  buttonContainerStyle: {
    width: "100%",
  },
  buttonTitleStyle: {
    padding: 0,
  },
  buttonStyle: {
    backgroundColor: AppColors.darkBluePrimary,
    borderRadius: 8,
    marginBottom: 45,
  },
});
