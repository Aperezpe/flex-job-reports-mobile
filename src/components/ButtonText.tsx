import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { Button, ButtonProps } from '@rneui/base';
import { globalStyles } from '../constants/GlobalStyles';
import { AppColors } from '../constants/AppColors';

type Props = {
  bold?: boolean;
} & PropsWithChildren &
  PressableProps;

const ButtonText = ({ children, bold, onPress }: Props) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
       <Text
        style={[
          globalStyles.textRegular,
          styles.text,
          styles.textButton,
          bold ? globalStyles.textBold : null,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

export default ButtonText

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.transparent
  },
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
  textButton: {
    textDecorationStyle: "dashed",
    color: AppColors.bluePrimary,
  },
});
