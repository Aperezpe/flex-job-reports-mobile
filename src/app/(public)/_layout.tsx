import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseAuth } from "../../context/SupabaseAuthContext";
import Footer from "../../components/login/Footer";
import Header from "../../components/login/Header";
import LoadingComponent from "../../components/LoadingComponent";
import { makeStyles } from "@rneui/themed";

const LoginRegisterLayout = () => {
  const styles = useStyles();
  const { isLoading } = useSupabaseAuth();

  if (isLoading) return <LoadingComponent />;

  return (
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
  );
};

export default LoginRegisterLayout;


const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: 25,
    backgroundColor: theme.colors.background
  },
}))