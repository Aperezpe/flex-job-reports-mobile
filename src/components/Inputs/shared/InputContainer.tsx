import React, { PropsWithChildren, useEffect, useState } from 'react';
import { GestureResponderEvent, Pressable } from 'react-native';
import { AppColors } from '../../../constants/AppColors';
import { makeStyles } from '@rneui/themed';

type InputContainerProps = {
  iconSize?: number | undefined;
  onPress?: null | ((event: GestureResponderEvent) => void) | undefined;
  isFocused: boolean;
  showInlineError?: boolean;
} & PropsWithChildren;

export const InputContainer: React.FC<InputContainerProps> = (
  props: InputContainerProps
) => {
  const {
    onPress,
    children,
    isFocused,
    showInlineError = false,
  } = props;

  const styles = useStyles();

  const [borderColor, setBorderColor] = useState(AppColors.inputBorder);

  useEffect(() => {
    if (showInlineError) setBorderColor(AppColors.inlineErrorColor);
    else if (isFocused) setBorderColor(AppColors.bluePrimary);
    else setBorderColor(AppColors.inputBorder);
  }, [showInlineError, isFocused]);

  return (
    <Pressable
      testID='input-container'
      style={[styles.inputContainer, {borderColor}]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1.5,
    borderRadius: 5,
    backgroundColor: theme.colors.textInput,
  },
}));
