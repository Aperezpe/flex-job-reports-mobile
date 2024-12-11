import { Alert, StyleSheet, View } from "react-native";
import React, { useRef, useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAuthScreenContext } from "../../context/AuthScreen.ctx";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import { AuthError } from "@supabase/supabase-js";
import {
  CustomTextInput,
  CustomTextInputRef,
} from "../../components/Inputs/CustomInput";
import AuthSubmitButton from "../../components/login/AuthSubmitButton";

const Login = () => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { formState, updateField, onSubmit } = useAuthScreenContext();
  const { signIn, isLoading } = useSupabaseAuth();
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  async function onSubmitLogin() {
    try {
      const { error } = await signIn(
        formState.values.email!,
        formState.values.password!
      );
      if (error) throw error;
    } catch (err: AuthError | any) {
      console.log(JSON.stringify("SignIn Error:", err));
      Alert.alert(err.message);
    }
  }

  return (
    <View style={styles.container}>
      <CustomTextInput
        ref={emailRef}
        value={formState.values.email}
        inlineErrorMessage={formState.errors.email}
        keyboardType="email-address"
        placeholder="Email*"
        onChangeText={(text) => updateField("email", text)}
        autoCapitalize="none"
        editable={!isLoading}
        LeftIcon={<MaterialIcons name="email" style={styles.leftIcon} />}
      />
      <CustomTextInput
        ref={passwordRef}
        value={formState.values.password}
        inlineErrorMessage={formState.errors.password}
        placeholder="Password*"
        autoCapitalize="none"
        onChangeText={(text) => updateField("password", text)}
        secureTextEntry={secureTextEntry}
        editable={!isLoading}
        LeftIcon={<MaterialIcons name="lock" style={styles.leftIcon} />}
        RightIcon={
          <MaterialCommunityIcons
            name={secureTextEntry ? "eye-off" : "eye"}
            style={styles.rightIcon}
            onPress={toggleSecureTextEntry}
          />
        }
      />
      <AuthSubmitButton
        isLoading={isLoading}
        onPress={() => onSubmit(onSubmitLogin)}
      >
        Login
      </AuthSubmitButton>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  leftIcon: {
    fontSize: 26,
  },
  rightIcon: {
    fontSize: 24,
  },
});
