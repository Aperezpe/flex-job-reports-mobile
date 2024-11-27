import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Input } from '@rneui/themed';
import { CustomTextInput } from '../../Inputs/CustomInput';

type LoginFormProps = {

} ;

export default function LoginFormView(props: LoginFormProps) {
  return (
    <View>
      <CustomTextInput placeholder='Email*' />
    </View>
  );
}

const styles = StyleSheet.create({

});
