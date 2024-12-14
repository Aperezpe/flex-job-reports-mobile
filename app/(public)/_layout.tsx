import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import React from "react";
import {
  AuthScreenProvider,
} from "../../context/AuthScreen.ctx";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import Footer from "../../components/login/Footer";
import Header from "../../components/login/Header";

const LoginRegisterLayout = () => {
  const { isLoading } = useSupabaseAuth();

  if (isLoading) return <ActivityIndicator testID="loading-indicator" style={{ flex: 1 }} />;

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

export default LoginRegisterLayout;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  }
});
