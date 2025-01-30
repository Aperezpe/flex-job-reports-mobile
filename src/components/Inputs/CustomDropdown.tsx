import React, {
  ReactElement,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  type TextInputProps,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { InputContainer } from './shared/InputContainer';
import { AppColors } from '../../constants/AppColors';
import { globalStyles } from '../../constants/GlobalStyles';

type CustomTextInputProps = {
  iconSize?: number | undefined;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inlineErrorMessage?: string;
  LeftIcon?: ReactElement;
  RightIcon?: ReactElement;
} & TextInputProps;

export type TextInputRef = {
  focusInput: () => void;
  blurInput: () => void;
};

export const CustomTextInput = forwardRef<TextInputRef, CustomTextInputProps>(
  (props, ref) => {
    const {
      placeholder,
      value,
      autoCapitalize,
      onChangeText,
      keyboardType,
      inlineErrorMessage,
      onSubmitEditing,
      RightIcon,
      secureTextEntry,
      returnKeyType,
      textContentType,
      iconSize = 14,
      editable,
      inputContainerStyle,
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
      onChangeText?.('');
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
          textInputRef.current.blur();
        }
      },
    }));

    const showInlineError = inlineErrorMessage !== undefined && inlineErrorMessage !== '';

    return (
      <View style={inputContainerStyle}>
        <InputContainer
          isFocused={isFocused}
          onPress={() => onInputFocus()}
          showInlineError={showInlineError}
          style={{ backgroundColor: AppColors.whitePrimary }}
        >
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
            textContentType={textContentType}
            returnKeyType={returnKeyType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            editable={editable}
          />
          <AntDesign name='down' />
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
