import { View, Text, StyleSheet } from 'react-native';
import React, { useRef, useState } from 'react';
import { Input } from '@rneui/themed';
import { CustomTextInput, CustomTextInputRef } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LoginForm } from '../types/LoginForm';
import { useAuth } from '../../../context/Auth.ctx';


export default function LoginFormView() {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { loginFormState, loginFormDispatch } = useAuth();
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  const handleOnChangeText = (field: keyof LoginForm, value: string | undefined) => {
    loginFormDispatch({ type: 'UPDATE_FIELD', field, value })
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        ref={emailRef}
        value={loginFormState.values.email}
        showInlineError={loginFormState.errors.email !== undefined} // TODO: Not working
        inlineErrorMessage={loginFormState.errors.email}
        keyboardType='email-address'
        placeholder='Email*'
        onChangeText={(text) => handleOnChangeText('email', text)}
        autoCapitalize='none'
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        ref={passwordRef}
        value={loginFormState.values.password}
        placeholder='Password*'
        autoCapitalize='none'
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
    </View>
  );
}

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
