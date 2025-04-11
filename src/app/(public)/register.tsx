import { Alert, TouchableOpacity, View } from "react-native";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import {
  CustomTextInput,
  TextInputRef,
} from "../../components/Inputs/CustomInput";
import { RegisterTabs } from "../../types/Auth/RegisterTabs";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSupabaseAuth } from "../../context/SupabaseAuthContext";
import { CompanyUIDResponse } from "../../types/Company";
import { PGRST116 } from "../../constants/ErrorCodes";
import TextLink from "../../components/TextLink";
import AuthSubmitButton from "../../components/login/AuthSubmitButton";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  CompanyIdSchema,
  LoginSchema,
} from "../../constants/ValidationSchemas";
import { supabase } from "../../config/supabase";
import { CheckBox, Text } from "@rneui/themed";
import { makeStyles } from "@rneui/themed";
import { UserStatus } from "../../types/Auth/AppUser";

const Register = () => {
  const styles = useStyles();
  const companyNameRef = useRef<TextInputRef | null>(null);
  const nameRef = useRef<TextInputRef | null>(null);
  const emailRef = useRef<TextInputRef | null>(null);
  const phoneRef = useRef<TextInputRef | null>(null);
  const passwordRef = useRef<TextInputRef | null>(null);
  const retypePasswordRef = useRef<TextInputRef | null>(null);
  const companyIdRef = useRef<TextInputRef | null>(null);

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [checked, setChecked] = useState(false);
  const { signUp, isLoading } = useSupabaseAuth();

  const [selectedTab, setSelectedTab] = useState<RegisterTabs>(
    RegisterTabs.TECHNICIAN
  );
  const [startValidating, setStartValidating] = useState(false);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);
  const inTechnicianTab = selectedTab === RegisterTabs.TECHNICIAN;

  const getCompanyUID = async (
    companyUID: string
  ): Promise<CompanyUIDResponse> => {
    const { data, error } = await supabase
      .from("company_uids")
      .select("company_uid")
      .eq("company_uid", companyUID)
      .single();

    return {
      data: {
        companyUID: data?.company_uid,
      },
      error,
    };
  };

  const companyIDExists = async (inputCompanyID: string) => {
    const {
      data: { companyUID },
      error,
    } = await getCompanyUID(inputCompanyID);
    if (companyUID) return { exists: true, companyIDError: null };
    else return { exists: false, companyIDError: error };
  };

  const TechnicianSchema = LoginSchema.shape({
    fullName: Yup.string()
      .required("Full name is required")
      .trim()
      .min(2, "Full name must be at least 2 characters long")
      .max(100, "Full name cannot exceed 100 characters")
      .matches(
        /^[a-zA-Z-' ]+$/,
        "Full name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    phoneNumber: Yup.string()
      .trim()
      .matches(
        /^[+]?[\d\s-()]{10,15}$/,
        "Phone number must be 10-15 digits and can include spaces, dashes, or parentheses"
      ),
    retypePassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  }).concat(CompanyIdSchema);

  const CompanyAdminSchema = TechnicianSchema.shape({
    companyName: Yup.string()
      .required("Company name is required")
      .trim()
      .min(2, "Company name must be at least 2 characters long")
      .max(50, "Company name cannot exceed 50 characters")
      .matches(
        /^[a-zA-Z0-9&.' -]+$/,
        "Company name can only include letters, numbers, spaces, and common symbols like &, ., -, and '"
      ),
  });

  async function onSubmitRegister(values: {
    email: string;
    password: string;
    retypePassword: string;
    companyId: string;
    companyName: string;
    fullName: string;
    phoneNumber: string;
  }) {
    try {
      const { exists, companyIDError } = await companyIDExists(
        values.companyId
      );

      // Don't proceed if Company Admin typed an existing Company ID
      if (exists && !inTechnicianTab) throw Error("Company ID already exists");
      // PGRST116 | 406 | More than 1 or no items where returned when requesting a singular response
      // (https://docs.postgrest.org/en/v12/references/errors.html)
      if (companyIDError && companyIDError.code === PGRST116 && inTechnicianTab)
        throw Error("Company ID not found");

      const { error } = await signUp({
        email: values.email,
        password: values.password,
        data: {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          companyUID: values.companyId,
          companyName: values.companyName,
          status: inTechnicianTab ? UserStatus.PENDING : UserStatus.ADMIN,
        },
      });

      if (error) Alert.alert(error.message);
    } catch (error: Error | unknown) {
      console.log(error);
      Alert.alert((error as Error).message);
    }
  }

  function onSubmit(
    submit: (e?: FormEvent<HTMLFormElement> | undefined) => void
  ) {
    setStartValidating(true);
    submit();
  }

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textSubtitle, styles.registerAs]} >
        Register As
      </Text>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            ...inTechnicianTab ? styles.tabSelected : styles.tabUnselected,
              // ? selectedColor
              // : AppColors.transparent,
          }}
          onPress={() => setSelectedTab(RegisterTabs.TECHNICIAN)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              inTechnicianTab ? styles.tabTextSelected : null,
            ]}
          >
            Technician
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            ...inTechnicianTab
              ? styles.tabUnselected
              : styles.tabSelected,
          }}
          onPress={() => setSelectedTab(RegisterTabs.COMPANY_ADMIN)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              !inTechnicianTab ? styles.tabTextSelected : null,
            ]}
          >
            Company Admin
          </Text>
        </TouchableOpacity>
      </View>

      {!inTechnicianTab && (
        <Text style={[globalStyles.textSubtitle, styles.formSubtitle]}>
          Company Info
        </Text>
      )}
      <Formik
        initialValues={{
          email: "",
          password: "",
          retypePassword: "",
          companyId: "",
          companyName: "",
          fullName: "",
          phoneNumber: "",
        }}
        onSubmit={onSubmitRegister}
        validationSchema={
          inTechnicianTab ? TechnicianSchema : CompanyAdminSchema
        }
        validateOnChange={startValidating}
        validateOnBlur={startValidating}
      >
        {({ handleChange, handleSubmit, values, errors, resetForm }) => {
          useEffect(() => {
            setStartValidating(false);
            resetForm();
          }, [selectedTab]);

          return (
            <View style={styles.formContainer}>
              <CustomTextInput
                value={values.companyId}
                inlineErrorMessage={errors.companyId}
                placeholder={
                  !inTechnicianTab ? "Create Company ID*" : "Company ID*"
                }
                returnKeyType="next"
                ref={companyIdRef}
                onSubmitEditing={() =>
                  !inTechnicianTab
                    ? companyNameRef.current?.focusInput()
                    : nameRef.current?.focusInput()
                }
                autoCapitalize="none"
                onChangeText={handleChange("companyId")}
                LeftIcon={
                  <MaterialCommunityIcons
                    name="office-building"
                    style={styles.leftIcon}
                  />
                }
              />

              {!inTechnicianTab && (
                <View style={styles.formContainer}>
                  <CustomTextInput
                    value={values.companyName}
                    placeholder="Company Name*"
                    inlineErrorMessage={errors.companyName}
                    ref={companyNameRef}
                    keyboardType="default"
                    returnKeyType="next"
                    onChangeText={handleChange("companyName")}
                    onSubmitEditing={() => nameRef?.current?.focusInput()}
                    autoCapitalize="none"
                    LeftIcon={
                      <MaterialCommunityIcons
                        name="office-building"
                        style={styles.leftIcon}
                      />
                    }
                  />
                  <Text
                    style={[globalStyles.textSubtitle, styles.formSubtitle]}
                  >
                    Admin Info
                  </Text>
                </View>
              )}
              <CustomTextInput
                value={values.fullName}
                placeholder="Full Name*"
                inlineErrorMessage={errors.fullName}
                ref={nameRef}
                keyboardType="default"
                returnKeyType="next"
                onChangeText={handleChange("fullName")}
                onSubmitEditing={() => emailRef?.current?.focusInput()}
                autoCapitalize="words"
                LeftIcon={
                  <MaterialIcons name="person" style={styles.leftIcon} />
                }
              />
              <CustomTextInput
                value={values.email}
                ref={emailRef}
                returnKeyType="next"
                inlineErrorMessage={errors.email}
                placeholder="Email*"
                keyboardType="email-address"
                onSubmitEditing={() => phoneRef?.current?.focusInput()}
                onChangeText={handleChange("email")}
                autoCapitalize="none"
                LeftIcon={
                  <MaterialIcons name="email" style={styles.leftIcon} />
                }
              />
              <CustomTextInput
                value={values.phoneNumber}
                ref={phoneRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focusInput}
                placeholder="Phone Number (Optional)"
                onChangeText={handleChange("phoneNumber")}
                keyboardType="phone-pad"
                LeftIcon={
                  <MaterialIcons name="phone" style={styles.leftIcon} />
                }
              />
              <CustomTextInput
                value={values.password}
                placeholder="Password*"
                autoCapitalize="none"
                inlineErrorMessage={errors.password}
                returnKeyType="next"
                ref={passwordRef}
                onSubmitEditing={() => retypePasswordRef.current?.focusInput()}
                onChangeText={handleChange("password")}
                secureTextEntry={secureTextEntry}
                textContentType={"oneTimeCode"}
                LeftIcon={<MaterialIcons name="lock" style={styles.leftIcon} />}
                RightIcon={
                  <MaterialCommunityIcons
                    name={secureTextEntry ? "eye-off" : "eye"}
                    style={styles.rightIcon}
                    onPress={toggleSecureTextEntry}
                  />
                }
              />
              <CustomTextInput
                value={values.retypePassword}
                placeholder="Re-Type Password*"
                returnKeyType={"done"}
                inlineErrorMessage={errors.retypePassword}
                ref={retypePasswordRef}
                textContentType={"oneTimeCode"}
                onSubmitEditing={() => retypePasswordRef.current?.blurInput()}
                autoCapitalize="none"
                onChangeText={handleChange("retypePassword")}
                secureTextEntry={secureTextEntry}
                LeftIcon={<MaterialIcons name="lock" style={styles.leftIcon} />}
                RightIcon={
                  <MaterialCommunityIcons
                    name={secureTextEntry ? "eye-off" : "eye"}
                    style={styles.rightIcon}
                    onPress={toggleSecureTextEntry}
                  />
                }
              />
              <CheckBox
                testID="terms-and-conditions-checkbox"
                title={
                  <View style={styles.termsAndConditionsContainer}>
                    <Text style={[globalStyles.textRegular, styles.text]} >
                      I agree to the{"  "}
                    </Text>
                    <TextLink href="modal">Terms & Conditions</TextLink>
                  </View>
                }
                checked={checked} // TODO: hande this
                containerStyle={styles.checkboxContainer}
                onPress={() => setChecked(!checked)}
              />
              <AuthSubmitButton
                isLoading={isLoading}
                onPress={() => onSubmit(handleSubmit)}
                disabled={!checked}
              >
                Register
              </AuthSubmitButton>
            </View>
          );
        }}
      </Formik>
    </View>
  );
};

export default Register;


const useStyles = makeStyles((theme) => ({
  container: {
    gap: 16,
  },
  formContainer: {
    gap: 16,
  },
  registerAs: {
    textAlign: "center",
  },
  tabGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderRadius: 12,
    backgroundColor: AppColors.tabsBackground,
  },
  tabContainer: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
  },
  tabUnselected: {
    backgroundColor: theme.colors.transparent
  },
  tabText: {
    textAlign: "center",
  },
  tabTextSelected: {
    fontFamily: "HindVadodara_700Bold",
    color: AppColors.lightGrayPrimary,
  },
  formSubtitle: { textAlign: "center" },
  leftIcon: {
    fontSize: 26,
    color: theme.colors.black
  },
  rightIcon: {
    fontSize: 24,
    color: theme.colors.black
  },
  // Checkbox styles
  checkboxContainer: { padding: 0 },
  termsAndConditionsContainer: {
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
  },
}))

