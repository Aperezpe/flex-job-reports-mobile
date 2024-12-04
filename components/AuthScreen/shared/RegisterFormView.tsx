import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import { AppColors } from '../../../constants/AppColors';
import { globalStyles } from '../../../constants/GlobalStyles';
import { CustomTextInputRef, CustomTextInput } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuthScreenContext } from '../../../context/AuthScreen.ctx';
import { RegisterTabs } from '../../../types/Auth/RegisterTabs';

export default function RegisterFormView() {
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
  
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { selectedTab, setSelectedTab, formState, updateField } = useAuthScreenContext();

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);
  const inTechnicianTab = selectedTab === RegisterTabs.TECHNICIAN;

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
        value={formState.values.companyId}
        inlineErrorMessage={formState.errors.companyId}
        placeholder={!inTechnicianTab ? 'Create Company ID*' : 'Company ID*'}
        returnKeyType='next'
        ref={companyIdRef}
        onSubmitEditing={() =>
          !inTechnicianTab
            ? companyNameRef.current?.focusInput()
            : nameRef.current?.focusInput()
        }
        autoCapitalize='none'
        onChangeText={(text) => updateField('companyId', text)}
        LeftIcon={
          <MaterialCommunityIcons name='office-building' style={styles.leftIcon} />
        }
      />

      {!inTechnicianTab && (
        <View style={styles.formContainer}>
          <CustomTextInput
            value={formState.values.companyName}
            placeholder='Company Name*'
            inlineErrorMessage={formState.errors.companyName}
            ref={companyNameRef}
            keyboardType='default'
            returnKeyType='next'
            onChangeText={(text) => updateField('companyName', text)}
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
            value={formState.values.companyAddress}
            placeholder='Company Address (Optional)'
            ref={companyAddressRef}
            keyboardType='default'
            returnKeyType='next'
            onChangeText={(text) => updateField('companyAddress', text)}
            onSubmitEditing={() => companyPhoneNumberRef?.current?.focusInput()}
            autoCapitalize='none'
            LeftIcon={
              <MaterialCommunityIcons name='map-marker' style={styles.leftIcon} />
            }
          />
          <CustomTextInput
            value={formState.values.companyPhone}
            placeholder='Company Phone Number (Optional)'
            ref={companyPhoneNumberRef}
            keyboardType='phone-pad'
            returnKeyType='next'
            onChangeText={(text) => updateField('companyPhone', text)}
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
        value={formState.values.fullName}
        placeholder='Full Name*'
        inlineErrorMessage={formState.errors.fullName}
        ref={nameRef}
        keyboardType='default'
        returnKeyType='next'
        onChangeText={(text) => updateField('fullName', text)}
        onSubmitEditing={() => emailRef?.current?.focusInput()}
        autoCapitalize='words'
        LeftIcon={<MaterialIcons name='person' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.email}
        ref={emailRef}
        returnKeyType='next'
        inlineErrorMessage={formState.errors.email}
        placeholder='Email*'
        keyboardType='email-address'
        onSubmitEditing={() => phoneRef?.current?.focusInput()}
        onChangeText={(text) => updateField('email', text)}
        autoCapitalize='none'
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.phoneNumber}
        ref={phoneRef}
        returnKeyType='next'
        onSubmitEditing={() => console.log('que?')}
        placeholder='Phone Number (Optional)'
        onChangeText={(text) => updateField('phoneNumber', text)}
        keyboardType='phone-pad'
        LeftIcon={<MaterialIcons name='phone' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={formState.values.password}
        placeholder='Password*'
        autoCapitalize='none'
        inlineErrorMessage={formState.errors.password}
        returnKeyType='next'
        ref={passwordRef}
        onSubmitEditing={() => retypePasswordRef?.current?.focusInput()}
        onChangeText={(text) => updateField('password', text)}
        secureTextEntry={secureTextEntry}
        textContentType={'oneTimeCode'}
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
        value={formState.values.retypePassword}
        placeholder='Re-Type Password*'
        returnKeyType={'done'}
        inlineErrorMessage={formState.errors.retypePassword}
        ref={retypePasswordRef}
        textContentType={'oneTimeCode'}
        onSubmitEditing={() => retypePasswordRef.current?.blurInput()}
        autoCapitalize='none'
        onChangeText={(text) => updateField('retypePassword', text)}
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
