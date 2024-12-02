import { View, Text, StyleSheet } from 'react-native';
import React, { useRef, useState } from 'react';
import { Input } from '@rneui/themed';
import { CustomTextInput, CustomTextInputRef } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/Auth.ctx';
import { AuthForm } from '../../../types/Auth/AuthForm';


export default function LoginFormView() {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { formState, formDispatch } = useAuth();
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  const handleOnChangeText = (field: keyof AuthForm, value: string | undefined) => {
    formDispatch({ type: 'UPDATE_FIELD', field, value })
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        ref={emailRef}
        value={formState.values.email}
        inlineErrorMessage={formState.errors.email}
        keyboardType='email-address'
        placeholder='Email*'
        onChangeText={(text) => handleOnChangeText('email', text)}
        autoCapitalize='none'
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        ref={passwordRef}
        value={formState.values.password}
        inlineErrorMessage={formState.errors.password}
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
