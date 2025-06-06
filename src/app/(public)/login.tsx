import { Alert, View } from "react-native";
import React, { FormEvent, useRef, useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSupabaseAuth } from "../../context/SupabaseAuthContext";
import {
  CustomTextInput,
  TextInputRef,
} from "../../components/Inputs/CustomInput";
import AuthSubmitButton from "../../components/login/AuthSubmitButton";
import { Formik } from "formik";
import { LoginSchema } from "../../constants/ValidationSchemas";
import { AuthError } from "@supabase/supabase-js";
import { makeStyles } from "@rneui/themed";

const Login = () => {
  const styles = useStyles();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [startValidating, setStartValidating] = useState(false);
  const { signIn, isLoading } = useSupabaseAuth();
  const emailRef = useRef<TextInputRef | null>(null);
  const passwordRef = useRef<TextInputRef | null>(null);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  async function onSubmitLogin(values: { email: string; password: string }) {
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) throw error;
    } catch (err: AuthError | unknown) {
      console.log("SignIn Error:", JSON.stringify(err));
      Alert.alert((err as AuthError).message);
    }
  }

  function onSubmit(submit: (e?: FormEvent<HTMLFormElement> | undefined) => void) {
    setStartValidating(true);
    submit();
  }

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={onSubmitLogin}
      validationSchema={LoginSchema}
      validateOnChange={startValidating}
      validateOnBlur={startValidating}
    >
      {({ handleChange, handleSubmit, values, errors }) => {
        return (
          <View style={styles.container}>
            <CustomTextInput
              ref={emailRef}
              value={values.email}
              inlineErrorMessage={errors.email}
              keyboardType="email-address"
              placeholder="Email*"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focusInput()}
              onChangeText={handleChange("email")}
              autoCapitalize="none"
              editable={!isLoading}
              LeftIcon={<MaterialIcons name="email" style={styles.leftIcon} />}
            />
            <CustomTextInput
              ref={passwordRef}
              value={values.password}
              inlineErrorMessage={errors.password}
              placeholder="Password*"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={() => onSubmit(handleSubmit)}
              onChangeText={handleChange("password")}
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
              onPress={() => onSubmit(handleSubmit)}
            >
              Login
            </AuthSubmitButton>
          </View>
        );
      }}
    </Formik>
  );
};

export default Login;

const useStyles = makeStyles((theme) => ({
  container: {
    gap: 16,
  },
  leftIcon: {
    fontSize: 26,
    color: theme.colors.black
  },
  rightIcon: {
    fontSize: 24,
    color: theme.colors.black
  },
}));
