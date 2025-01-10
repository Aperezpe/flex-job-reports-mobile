import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import React from "react";
import { Redirect, Slot, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import Footer from "../../components/login/Footer";
import Header from "../../components/login/Header";
import LoadingComponent from "../../components/LoadingComponent";
import { AppColors } from "../../constants/AppColors";
import { ThemeProvider } from "@rneui/themed";

const LoginRegisterLayout = () => {
  const { isLoading } = useSupabaseAuth();

  if (isLoading) return <LoadingComponent />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 , backgroundColor: AppColors.whitePrimary }}
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
  );
};

export default LoginRegisterLayout;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
});
