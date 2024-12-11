import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import {
  AuthScreenProvider,
  useAuthScreenContext,
} from "../../context/AuthScreen.ctx";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Button, Text } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import TextLink from "../../components/TextLink";

const LoginRegisterLayout = () => {
  
  return (
    <AuthScreenProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
          >

            <Header />
            <Slot />
            <Footer />

          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </AuthScreenProvider>
  );
};

const PrefillButton = () => {
  const { prefillCompanyAdminFormMock } = useAuthScreenContext();

  return (
    <Button onPress={prefillCompanyAdminFormMock}>Prefill Mock Form</Button>
  );
};

const Header = () => {
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
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
  );
};

const Footer = () => {
  const { inLoginPage } = useAuthScreenContext();

  return (
    <View style={styles.footer}>
      <PrefillButton />
      <View style={styles.loginOrRegisterContainer}>
        <Text style={[globalStyles.textRegular, styles.text]}>
          {inLoginPage
            ? `Don't have an account yet?`
            : `Already have an account?`}
          {"  "}
        </Text>
        <TextLink href={inLoginPage ? "register" : "login"}>
          {inLoginPage ? "Sign Up" : "Login"}
        </TextLink>
      </View>
    </View>
  );
};

export default LoginRegisterLayout;

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
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
  footer: {
    gap: 10,
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
  },
  // Login or Register styles
  loginOrRegisterContainer: {
    flexDirection: "row",
  },

});
