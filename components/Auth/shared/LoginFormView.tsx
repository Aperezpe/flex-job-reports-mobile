import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Input } from '@rneui/themed';
import { CustomTextInput } from '../../Inputs/CustomInput';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LoginForm } from '../types/LoginForm';

type LoginFormProps = {
  loginForm: LoginForm;
  setForm: React.Dispatch<React.SetStateAction<LoginForm>>;
};

export default function LoginFormView(props: LoginFormProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { loginForm, setForm } = props;

  const toggleSecureTextEntry = () => setSecureTextEntry(!secureTextEntry);

  const handleOnChangeText = (input: Partial<LoginForm>) => {
    setForm((prevForm) => ({ ...prevForm, ...input }));
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        value={loginForm.email}
        placeholder='Email*'
        onChangeText={(text) => handleOnChangeText({ email: text })}
        autoCapitalize='none'
        LeftIcon={<MaterialIcons name='email' style={styles.leftIcon} />}
      />
      <CustomTextInput
        value={loginForm.password}
        placeholder='Password*'
        autoCapitalize='none'
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
