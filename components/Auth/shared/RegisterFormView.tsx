import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { AppColors } from '../../../constants/AppColors';
import { globalStyles } from '../../../constants/GlobalStyles';
import { CustomTextInputRef, CustomTextInput } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { RegisterForm } from '../types/RegisterForm';
import { useAuth } from '../../../context/Auth.ctx';
import { RegisterTabs } from '../../../types/Auth/RegisterTabs';

export default function RegisterFormView() {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const selectedColor = AppColors.bluePrimary;
  const companyNameRef = useRef<CustomTextInputRef | null>(null);
  const companyAddressRef = useRef<CustomTextInputRef | null>(null);
  const companyPhoneNumberRef = useRef<CustomTextInputRef | null>(null);
  const nameRef = useRef<CustomTextInputRef | null>(null);
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const phoneRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);
  const retypePasswordRef = useRef<CustomTextInputRef | null>(null);
  const companyIdRef = useRef<CustomTextInputRef | null>(null);
  const { inTechnicianTab, setSelectedTab, registerFormState, registerFormDispatch } = useAuth();

  const handleOnChangeText = (field: keyof RegisterForm, value: string | undefined) => {
    registerFormDispatch({ type: 'UPDATE_FIELD', field, value })
  };

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textSubtitle, styles.registerAs]}>Register As</Text>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor: inTechnicianTab ? selectedColor : AppColors.transparent,
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
            backgroundColor: inTechnicianTab ? AppColors.transparent : selectedColor,
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
        value={registerFormState.values.companyId}
        placeholder={!inTechnicianTab ? 'Create Company ID*' : 'Company ID*'}
        returnKeyType='next'
        ref={companyIdRef}
        onSubmitEditing={() =>
          !inTechnicianTab
            ? companyNameRef.current?.focusInput()
            : nameRef.current?.focusInput()
        }
        autoCapitalize='none'
        onChangeText={(text) => handleOnChangeText('companyId', text)}
        LeftIcon={
          <MaterialCommunityIcons name='office-building' style={styles.leftIcon} />
        }
      />

      {!inTechnicianTab && (
        <View style={styles.formContainer}>
          <CustomTextInput
            value={registerFormState.values.companyName}
            placeholder='Company Name*'
            ref={companyNameRef}
            keyboardType='default'
            returnKeyType='next'
            onChangeText={(text) => handleOnChangeText('companyName', text)}
            onSubmitEditing={() => companyAddressRef?.current?.focusInput()}
            autoCapitalize='none'
            LeftIcon={
              <MaterialCommunityIcons
                name='office-building'
                style={styles.leftIcon}
              />
            }
          />
          <CustomTextInput
            value={registerFormState.values.companyAddress}
            placeholder='Company Address (Optional)'
            ref={companyAddressRef}
            keyboardType='default'
            returnKeyType='next'
            onChangeText={(text) => handleOnChangeText('companyAddress', text)}
            onSubmitEditing={() => companyPhoneNumberRef?.current?.focusInput()}
            autoCapitalize='none'
            LeftIcon={
              <MaterialCommunityIcons name='map-marker' style={styles.leftIcon} />
            }
          />
          <CustomTextInput
            value={registerFormState.values.companyPhone}
            placeholder='Company Phone Number (Optional)'
            ref={companyPhoneNumberRef}
            keyboardType='phone-pad'
            returnKeyType='next'
            onChangeText={(text) => handleOnChangeText('companyPhone', text)}
            onSubmitEditing={() => nameRef?.current?.focusInput()}
            autoCapitalize='none'
            LeftIcon={<MaterialIcons name='phone' style={styles.leftIcon} />}
          />
          <Text style={[globalStyles.textSubtitle, styles.formSubtitle]}>
            Admin Info
          </Text>
        </View>
      )}
      <CustomTextInput
        value={registerFormState.values.fullName}
        placeholder='Full Name*'
        ref={nameRef}
        keyboardType='default'
        returnKeyType='next'
        onChangeText={(text) => handleOnChangeText('fullName', text)}
        onSubmitEditing={() => emailRef?.current?.focusInput()}
        autoCapitalize='words'
        LeftIcon={<MaterialIcons name='person' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={registerFormState.values.email}
        ref={emailRef}
        returnKeyType='next'
        placeholder='Email*'
        keyboardType='email-address'
        onSubmitEditing={() => phoneRef?.current?.focusInput()}
        onChangeText={(text) => handleOnChangeText('email', text)}
        autoCapitalize='none'
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={registerFormState.values.phoneNumber}
        ref={phoneRef}
        returnKeyType='next'
        onSubmitEditing={() => console.log("que?")}
        placeholder='Phone Number (Optional)'
        onChangeText={(text) => handleOnChangeText('phoneNumber', text)}
        keyboardType='phone-pad'
        LeftIcon={<MaterialIcons name='phone' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={registerFormState.values.password}
        placeholder='Password*'
        autoCapitalize='none'
        returnKeyType='next'
        ref={passwordRef}
        onSubmitEditing={() => retypePasswordRef?.current?.focusInput()}
        onChangeText={(text) => handleOnChangeText('password', text)}
        secureTextEntry={secureTextEntry}
        LeftIcon={<MaterialIcons name='lock' style={styles.leftIcon} />}
        RightIcon={
          <MaterialCommunityIcons
            name={secureTextEntry ? 'eye-off' : 'eye'}
            style={styles.rightIcon}
            onPress={toggleSecureTextEntry}
          />
        }
      />
      <CustomTextInput
        value={registerFormState.values.retypePassword}
        placeholder='Re-Type Password*'
        returnKeyType={'done'}
        ref={retypePasswordRef}
        onSubmitEditing={() => retypePasswordRef.current?.blurInput()}
        autoCapitalize='none'
        onChangeText={(text) => handleOnChangeText('retypePassword', text)}
        secureTextEntry={secureTextEntry}
        LeftIcon={<MaterialIcons name='lock' style={styles.leftIcon} />}
        RightIcon={
          <MaterialCommunityIcons
            name={secureTextEntry ? 'eye-off' : 'eye'}
            style={styles.rightIcon}
            onPress={toggleSecureTextEntry}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  registerAs: {
    textAlign: 'center',
  },
  tabGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  tabTextSelected: {
    fontFamily: 'HindVadodara_700Bold',
    color: AppColors.lightGrayPrimary,
  },
  formSubtitle: { textAlign: 'center' },
  formContainer: {
    gap: 16,
  },
  leftIcon: {
    fontSize: 26,
  },
  rightIcon: {
    fontSize: 24,
  },
});
