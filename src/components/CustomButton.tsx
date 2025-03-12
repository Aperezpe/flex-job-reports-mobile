import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import React, { PropsWithChildren } from "react";
import { globalStyles } from "../constants/GlobalStyles";
import { AppColors } from "../constants/AppColors";
import { makeStyles } from "@rneui/themed";

type Props = {
  primary?: boolean;
  secondary?: boolean;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
} & TouchableOpacityProps &
  PropsWithChildren;

const CustomButton = ({
  onPress,
  children,
  primary = false,
  secondary = false,
  buttonContainerStyle,
  buttonTextStyle,
}: Props) => {
  const styles = useStyles({ primary, secondary });
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.row, styles.buttonContainer, buttonContainerStyle]}
    >
      <View style={styles.button}>
        <Text style={[globalStyles.textSemiBold, styles.buttonText, buttonTextStyle]}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;

const useStyles = makeStyles((theme, props: Props) => {
  let buttonTheme: StyleProp<ViewStyle> & StyleProp<TextStyle> = {
    backgroundColor: theme.colors.blueOpacity,
    color: theme.colors.primary
  };
  if (props.primary) {
    buttonTheme = {
      backgroundColor: AppColors.lightGrayPrimary,
      color: AppColors.darkBluePrimary,
    };
  } else if (props.secondary) {
    buttonTheme = {
      backgroundColor: AppColors.orange,
      color: AppColors.whitePrimary,
    };
  }

  return {
    buttonContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: buttonTheme.backgroundColor,
      gap: 3,
      borderRadius: 6,
    },
    button: {
      justifyContent: "center",
      alignContent: "center",
      padding: 1,
    },
    buttonText: {
      color: buttonTheme.color,
      paddingHorizontal: 8
    }
  };
});
