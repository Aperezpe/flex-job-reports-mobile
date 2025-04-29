import React, {
  ReactElement,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
  type TextInputProps,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { InputContainer } from './shared/InputContainer';
import { globalStyles } from '../../constants/GlobalStyles';
import { makeStyles } from '@rneui/themed';

export type CustomTextInputProps = {
  viewOnlyValue?: string;
  iconSize?: number | undefined;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  inlineErrorMessage?: string | any;
  LeftIcon?: ReactElement;
  RightIcon?: ReactElement;
  disabled?: boolean;
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
      viewOnlyValue,
      autoCapitalize,
      onChangeText,
      keyboardType,
      inlineErrorMessage,
      LeftIcon,
      onSubmitEditing,
      RightIcon,
      secureTextEntry,
      returnKeyType,
      textContentType,
      iconSize = 14,
      editable = true,
      inputWrapperStyle,
    } = props;

    const styles = useStyles();

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
      <View style={[{ flexGrow: 1 }, inputWrapperStyle]}>
        <InputContainer
          isFocused={isFocused}
          onPress={() => editable ? onInputFocus() : null}
          showInlineError={showInlineError}
        >
          {LeftIcon}
          <TextInput
            style={[globalStyles.textRegular, styles.textInput]}
            placeholderTextColor={styles.textInput.placeholder}
            placeholder={viewOnlyValue === undefined ? placeholder : ''}
            value={viewOnlyValue || value}
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
          {!RightIcon && isFocused && (
            <AntDesign
              name='closecircle'
              size={iconSize}
              onPress={handleClearText}
              style={styles.rightIcon}
            />
          )}
          {RightIcon && isFocused && RightIcon}
        </InputContainer>
        {showInlineError && (
          <Text style={globalStyles.inlineErrorText}>{inlineErrorMessage}</Text>
        )}
      </View>
    );
  }
);


const useStyles = makeStyles((theme) => ({
  inputContainer: {
    backgroundColor: theme.colors.textInput,
    opacity: 0.8,
  },
  textInput: {
    flex: 1,
    paddingLeft: 8,
    color: theme.colors.black,
    placeholder: theme.colors.placeholder,
  },
  rightIcon: {
    color: theme.colors.black,
  }
}))


