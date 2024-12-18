import { ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import { Button, ButtonProps } from "@rneui/themed";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {
  isLoading: boolean;
} & ButtonProps;

const AuthSubmitButton = ({ isLoading, onPress, disabled, children }: Props) => {
  return (
    <Button
      containerStyle={styles.buttonContainerStyle}
      buttonStyle={styles.buttonStyle}
      titleStyle={[globalStyles.textSubtitle, styles.buttonTitleStyle]}
      disabled={disabled}
      onPress={onPress}
    >
      {isLoading && (
        <ActivityIndicator size="small" color={AppColors.darkBluePrimary} />
      )}
      {children}
    </Button>
  );
};

export default AuthSubmitButton;

const styles = StyleSheet.create({
      // Bottom Button styles
  buttonContainerStyle: {
    width: '100%',
  },
  buttonTitleStyle: {
    padding: 0,
  },
  buttonStyle: {
    backgroundColor: AppColors.darkBluePrimary,
    borderRadius: 8,
    marginBottom: 45,
  },
});
