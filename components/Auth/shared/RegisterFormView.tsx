import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { AppColors } from '../../../constants/AppColors';
import { globalStyles } from '../../../constants/GlobalStyles';
import { TechnicianForm } from '../types/TechnicianForm';
import { CompanyAdminForm } from '../types/CompanyAdminForm';
import { CustomTextInputRef, CustomTextInput } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { RegisterForm } from '../types/RegisterForm';

type RegisterFormProps = {
  registerForm: RegisterForm;
  setForm: React.Dispatch<React.SetStateAction<RegisterForm>>;
};

export default function RegisterFormView(props: RegisterFormProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const selectedColor = AppColors.bluePrimary;
  const { registerForm, setForm } = props;
  const nameRef = useRef<CustomTextInputRef | null>(null);
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const phoneRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);
  const retypePasswordRef = useRef<CustomTextInputRef | null>(null);

  const handleOnChangeText = (input: Partial<RegisterForm>) => {
    setForm((prevForm) => ({ ...prevForm, ...input }));
  };

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textSubtitle, styles.registerAs]}>Register As</Text>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor:
              selectedTab === 0 ? selectedColor : AppColors.transparent,
          }}
          onPress={() => setSelectedTab(0)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              selectedTab === 0 ? styles.tabTextSelected : null,
            ]}
          >
            Technician
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor:
              selectedTab === 1 ? selectedColor : AppColors.transparent,
          }}
          onPress={() => setSelectedTab(1)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              selectedTab === 1 ? styles.tabTextSelected : null,
            ]}
          >
            Company Admin
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
        <Text style={[globalStyles.textSubtitle, styles.formSubtitle]}>
          Company Info
        </Text>

        <Text style={[globalStyles.textSubtitle, styles.formSubtitle]}>
          Admin Info
        </Text>
        <CustomTextInput
          value={registerForm.fullName}
          placeholder='Full Name*'
          ref={nameRef}
          keyboardType='default'
          returnKeyType='next'
          onChangeText={(text) => handleOnChangeText({ fullName: text })}
          onSubmitEditing={() => emailRef?.current?.focusInput() }
          autoCapitalize='words'
          LeftIcon={<MaterialIcons name='person' style={styles.leftIcon} />}
        />
        <CustomTextInput
          value={registerForm.email}
          ref={emailRef}
          returnKeyType='next'
          placeholder='Email*'
          keyboardType='email-address'
          onSubmitEditing={() => phoneRef?.current?.focusInput() }
          onChangeText={(text) => handleOnChangeText({ email: text })}
          autoCapitalize='none'
          LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
        />
        <CustomTextInput
          value={registerForm.phoneNumber}
          ref={phoneRef}
          onSubmitEditing={() => passwordRef?.current?.focusInput() }
          placeholder='Phone Number (Optional)'
          onChangeText={(text) => handleOnChangeText({ phoneNumber: text })}
          keyboardType='number-pad'
          LeftIcon={<MaterialIcons name='phone' style={styles.leftIcon} />}
        />
        <CustomTextInput
          value={registerForm.password}
          placeholder='Password*'
          autoCapitalize='none'
          returnKeyType='next'
          ref={passwordRef}
          onSubmitEditing={() => retypePasswordRef?.current?.focusInput() }
          onChangeText={(text) => handleOnChangeText({ password: text })}
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
          value={registerForm.retypePassword}
          placeholder='Re-Type Password*'
          returnKeyType='done'
          ref={retypePasswordRef}
          onSubmitEditing={() => retypePasswordRef.current?.blurInput() }
          autoCapitalize='none'
          onChangeText={(text) => handleOnChangeText({ retypePassword: text })}
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
