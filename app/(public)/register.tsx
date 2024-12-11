import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useRef, useState } from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import {
  CustomTextInput,
  CustomTextInputRef,
} from "../../components/Inputs/CustomInput";
import { useAuthScreenContext } from "../../context/AuthScreen.ctx";
import { RegisterTabs } from "../../types/Auth/RegisterTabs";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSupabaseAuth } from "../../context/SupabaseAuth.ctx";
import { supabase } from "../../config/supabase";
import { CompanyUIDResponse } from "../../types/Company";
import { PGRST116 } from "../../constants/ErrorCodes";
import { CheckBox } from "@rneui/themed";
import TextLink from "../../components/TextLink";
import { ADMIN, PENDING } from "../../constants";
import AuthSubmitButton from "../../components/login/AuthSubmitButton";

const Register = () => {
  const selectedColor = AppColors.bluePrimary;
  const companyNameRef = useRef<CustomTextInputRef | null>(null);
  const nameRef = useRef<CustomTextInputRef | null>(null);
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const phoneRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);
  const retypePasswordRef = useRef<CustomTextInputRef | null>(null);
  const companyIdRef = useRef<CustomTextInputRef | null>(null);

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [checked, setChecked] = useState(false);
  const { selectedTab, setSelectedTab, formState, updateField, onSubmit } =
    useAuthScreenContext();
  const { signUp, isLoading } = useSupabaseAuth();

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

  async function onSubmitRegister() {
    const isAdmin = selectedTab !== RegisterTabs.TECHNICIAN;
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
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textSubtitle, styles.registerAs]}>
        Register As
      </Text>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor: inTechnicianTab
              ? selectedColor
              : AppColors.transparent,
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
            backgroundColor: inTechnicianTab
              ? AppColors.transparent
              : selectedColor,
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

      <CustomTextInput
        value={formState.values.companyId}
        inlineErrorMessage={formState.errors.companyId}
        placeholder={!inTechnicianTab ? "Create Company ID*" : "Company ID*"}
        returnKeyType="next"
        ref={companyIdRef}
        onSubmitEditing={() =>
          !inTechnicianTab
            ? companyNameRef.current?.focusInput()
            : nameRef.current?.focusInput()
        }
        autoCapitalize="none"
        onChangeText={(text) => updateField("companyId", text)}
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
            value={formState.values.companyName}
            placeholder="Company Name*"
            inlineErrorMessage={formState.errors.companyName}
            ref={companyNameRef}
            keyboardType="default"
            returnKeyType="next"
            onChangeText={(text) => updateField("companyName", text)}
            onSubmitEditing={() => nameRef?.current?.focusInput()}
            autoCapitalize="none"
            LeftIcon={
              <MaterialCommunityIcons
                name="office-building"
                style={styles.leftIcon}
              />
            }
          />
          <Text style={[globalStyles.textSubtitle, styles.formSubtitle]}>
            Admin Info
          </Text>
        </View>
      )}
      <CustomTextInput
        value={formState.values.fullName}
        placeholder="Full Name*"
        inlineErrorMessage={formState.errors.fullName}
        ref={nameRef}
        keyboardType="default"
        returnKeyType="next"
        onChangeText={(text) => updateField("fullName", text)}
        onSubmitEditing={() => emailRef?.current?.focusInput()}
        autoCapitalize="words"
        LeftIcon={<MaterialIcons name="person" style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.email}
        ref={emailRef}
        returnKeyType="next"
        inlineErrorMessage={formState.errors.email}
        placeholder="Email*"
        keyboardType="email-address"
        onSubmitEditing={() => phoneRef?.current?.focusInput()}
        onChangeText={(text) => updateField("email", text)}
        autoCapitalize="none"
        LeftIcon={<MaterialIcons name="email" style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.phoneNumber}
        ref={phoneRef}
        returnKeyType="next"
        onSubmitEditing={() => console.log("que?")}
        placeholder="Phone Number (Optional)"
        onChangeText={(text) => updateField("phoneNumber", text)}
        keyboardType="phone-pad"
        LeftIcon={<MaterialIcons name="phone" style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.password}
        placeholder="Password*"
        autoCapitalize="none"
        inlineErrorMessage={formState.errors.password}
        returnKeyType="next"
        ref={passwordRef}
        onSubmitEditing={() => retypePasswordRef?.current?.focusInput()}
        onChangeText={(text) => updateField("password", text)}
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
        value={formState.values.retypePassword}
        placeholder="Re-Type Password*"
        returnKeyType={"done"}
        inlineErrorMessage={formState.errors.retypePassword}
        ref={retypePasswordRef}
        textContentType={"oneTimeCode"}
        onSubmitEditing={() => retypePasswordRef.current?.blurInput()}
        autoCapitalize="none"
        onChangeText={(text) => updateField("retypePassword", text)}
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
        title={
          <View style={styles.termsAndConditionsContainer}>
            <Text style={[globalStyles.textRegular, styles.text]}>
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
        onPress={() => onSubmit(onSubmitRegister)}
      >
        Register
      </AuthSubmitButton>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: AppColors.lightGraySecondary,
  },
  tabContainer: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  tabText: {
    textAlign: "center",
  },
  tabTextSelected: {
    fontFamily: "HindVadodara_700Bold",
    color: AppColors.lightGrayPrimary,
  },
  formSubtitle: { textAlign: "center" },
  formContainer: {
    gap: 16,
  },
  leftIcon: {
    fontSize: 26,
  },
  rightIcon: {
    fontSize: 24,
  },
  // Checkbox styles
  checkboxContainer: { padding: 0 },
  termsAndConditionsContainer: {
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
});
