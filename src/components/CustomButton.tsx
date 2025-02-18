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
import { Entypo } from "@expo/vector-icons";
import { globalStyles } from "../constants/GlobalStyles";
import { AppColors } from "../constants/AppColors";
import { makeStyles } from "@rneui/themed";

type Props = {
  primary?: boolean;
  secondary?: boolean;
  add?: boolean;
  circle?: boolean;
  circlePadding?: number;
  iconSize?: number;
  buttonContainerStyle?: StyleProp<ViewStyle>;
} & TouchableOpacityProps &
  PropsWithChildren;

const CustomButton = ({
  onPress,
  children,
  primary = false,
  secondary = false,
  add = false,
  circle = false,
  circlePadding = 0,
  iconSize = 18,
  buttonContainerStyle,
}: Props) => {
  const styles = useStyles({ primary, circle, circlePadding, secondary });
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.row, styles.buttonContainer, buttonContainerStyle]}
    >
      <View style={styles.button}>
        <Text style={[globalStyles.textSemiBold, styles.buttonText]}>
          {add && (
            <Entypo
              name="plus"
              size={iconSize}
              color={styles.buttonText.color}
            />
          )}
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
      paddingHorizontal: !props.circle ? 8 : null,
      padding: props.circle ? props.circlePadding : null,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: buttonTheme.backgroundColor,
      borderRadius: props.circle ? 50 : 5,
      gap: 3,
    },
    button: {
      justifyContent: "center",
      alignContent: "center",
      padding: 1,
    },
    buttonText: {
      color: buttonTheme.color,
    }
  };
});
