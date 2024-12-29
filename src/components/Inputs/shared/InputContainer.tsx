import React, { PropsWithChildren, useEffect, useState } from 'react';
import { GestureResponderEvent, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '../../../constants/AppColors';

type InputContainerProps = {
  iconSize?: number | undefined;
  onPress?: null | ((event: GestureResponderEvent) => void) | undefined;
  isFocused: boolean;
  showInlineError?: boolean;
  style?: StyleProp<ViewStyle>;
} & PropsWithChildren;

export const InputContainer: React.FC<InputContainerProps> = (
  props: InputContainerProps
) => {
  const {
    onPress,
    children,
    isFocused,
    showInlineError = false,
    style,
  } = props;

  const [borderColor, setBorderColor] = useState(AppColors.inputBorder);

  useEffect(() => {
    if (showInlineError) setBorderColor(AppColors.inlineErrorColor);
    else if (isFocused) setBorderColor(AppColors.bluePrimary);
    else setBorderColor(AppColors.inputBorder);
  }, [showInlineError, isFocused]);

  return (
    <Pressable
      testID='input-container'
      style={[styles.inputContainer, {borderColor}, style]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    backgroundColor: 'red',
  },
});
