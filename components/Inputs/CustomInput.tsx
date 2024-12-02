import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
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
import { globalStyles } from '../../constants/GlobalStyles';

type CustomTextInputProps = {
  iconSize?: number | undefined;
  inlineErrorMessage?: string;
  LeftIcon?: ReactElement;
  RightIcon?: ReactElement;
} & TextInputProps;

// Define the ref type with only the focus method
export type CustomTextInputRef = {
  focusInput: () => void;
  blurInput: () => void;
};

// TODO: Only show X button when focused
export const CustomTextInput = forwardRef<CustomTextInputRef, CustomTextInputProps>(
  (props, ref) => {
    const {
      placeholder,
      value,
      autoCapitalize,
      onChangeText,
      keyboardType,
      inlineErrorMessage,
      LeftIcon,
      onSubmitEditing,
      RightIcon,
      secureTextEntry,
      returnKeyType,
      iconSize = 14,
    } = props;

    const textInputRef = useRef<TextInput | null>(null);
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

    // Use useImperativeHandle to expose custom methods to the parent
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      },
      blurInput: () => {
        if (textInputRef.current) {
          textInputRef.current.blur;
        }
      },
    }));

    const showInlineError = inlineErrorMessage !== undefined && inlineErrorMessage !== '';

    return (
      <View>
        <InputContainer
          isFocused={isFocused}
          onPress={() => onInputFocus()}
          showInlineError={showInlineError}
          style={{ backgroundColor: AppColors.whitePrimary }}
        >
          {LeftIcon}
          <TextInput
            style={[globalStyles.textRegular, styles.textInput]}
            placeholderTextColor={AppColors.grayPlaceholder}
            placeholder={placeholder}
            value={value}
            ref={textInputRef}
            onChangeText={onChangeText}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onSubmitEditing={onSubmitEditing}
            multiline={false}
            returnKeyType={returnKeyType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
          />
          {!RightIcon && isFocused && (
            <AntDesign
              name='closecircle'
              size={iconSize}
              onPress={handleClearText}
            />
          )}
          {RightIcon && isFocused && RightIcon}
        </InputContainer>
        {showInlineError && (
          <Text style={styles.inlineErrorText}>{inlineErrorMessage}</Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    paddingLeft: 8,
  },
  inlineErrorText: {
    color: AppColors.inlineErrorColor,
    fontFamily: 'HindVadodara-Medium',
    fontSize: 12,
  },
});
