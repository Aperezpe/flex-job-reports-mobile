import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  type TextInputProps,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { InputContainer } from './shared/InputContainer';
import { AppColors } from '../../constants/AppColors';

type CustomTextInputProps = {
  iconSize?: number | undefined;
  showInlineError?: boolean;
  LeftIcon?: ReactNode;
} & TextInputProps;

// TODO: Only show X button when focused
export const CustomTextInput: React.FC<CustomTextInputProps> = (
  props: CustomTextInputProps
) => {
  const {
    placeholder,
    value,
    autoCapitalize,
    onChangeText,
    showInlineError = false,
    keyboardType,
    LeftIcon,
    iconSize = 14,
  } = props;

  const textInputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const onInputFocus = () => {
    textInputRef?.current?.focus();
    setIsFocused(true);
  };
  const onInputBlur = () => setIsFocused(false);

  const handleClearText = () => {
    textInputRef.current?.clear();
    value && onChangeText?.('');
  };
  // TODO: Don't allow alphabet characters if field is number-pad

  return (
    <View>
      <InputContainer
        isFocused={isFocused}
        onPress={() => onInputFocus()}
        showInlineError={showInlineError}
        style={{backgroundColor: AppColors.whitePrimary}}
      >
        {LeftIcon}
        <TextInput
          style={{ flex: 1 }}
          placeholderTextColor={AppColors.grayPlaceholder}
          placeholder={placeholder}
          value={value}
          ref={textInputRef}
          onChangeText={onChangeText}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
        {isFocused && <AntDesign name='closecircle' size={iconSize} onPress={handleClearText} />}
      </InputContainer>
      {/* <InlineErrorText showInlineError={showInlineError}>
        Please enter a name
      </InlineErrorText> */}
    </View>
  );
};
