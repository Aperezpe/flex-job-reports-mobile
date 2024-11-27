import { View, Text, TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import React, { PropsWithChildren } from 'react';
import { globalStyles } from '../../../constants/GlobalStyles';
import { AppColors } from '../../../constants/AppColors';

type TextLinkProps = {

} & PropsWithChildren & TouchableOpacityProps;

export default function TextLink({ children, onPress }: TextLinkProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[globalStyles.textRegular, styles.text, styles.textLink]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: AppColors.darkBluePrimary,
  },
  textLink: {
    textDecorationStyle: 'dashed',
    color: AppColors.bluePrimary,
  },
});
