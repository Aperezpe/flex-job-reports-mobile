import { View, StyleSheet } from 'react-native';
import React, { useRef, useState } from 'react';
import { CustomTextInput, CustomTextInputRef } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuthScreenContext } from '../../../context/AuthScreen.ctx';

type LoginFormViewProps = {
  loading: boolean
}

export default function LoginFormView({loading}: LoginFormViewProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { formState, updateField } = useAuthScreenContext();
  const emailRef = useRef<CustomTextInputRef | null>(null);
  const passwordRef = useRef<CustomTextInputRef | null>(null);

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  return (
    <View style={styles.container}>
      <CustomTextInput
        ref={emailRef}
        value={formState.values.email}
        inlineErrorMessage={formState.errors.email}
        keyboardType='email-address'
        placeholder='Email*'
        onChangeText={(text) => updateField('email', text)}
        autoCapitalize='none'
        editable={!loading}
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        ref={passwordRef}
        value={formState.values.password}
        inlineErrorMessage={formState.errors.password}
        placeholder='Password*'
        autoCapitalize='none'
        onChangeText={(text) => updateField('password', text)}
        secureTextEntry={secureTextEntry}
        editable={!loading}
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
