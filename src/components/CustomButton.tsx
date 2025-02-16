import {
  Text,
  View,
} from "react-native";
import React, { PropsWithChildren } from "react";
import { Entypo } from "@expo/vector-icons";
import { globalStyles } from "../constants/GlobalStyles";
import { AppColors } from "../constants/AppColors";
import { makeStyles } from "@rneui/themed";
import { Pressable, PressableProps } from "react-native-gesture-handler";

type Props = {
  primary?: boolean;
  add?: boolean;
} & PressableProps &
  PropsWithChildren;

const CustomButton = ({
  onPress,
  children,
  primary = false,
  add = false,
}: Props) => {
  const styles = useStyles({ primary });
  return (
    <Pressable
      onPress={onPress}
      style={[
        globalStyles.row,
        styles.buttonContainer,
        // primary ? styles.primaryButton : styles.secondaryButton,
      ]}
    >
      <View style={styles.button}>
        <Text style={[globalStyles.textSemiBold, styles.buttonText]}>
          {add && (
            <Entypo name="plus" size={18} color={styles.buttonText.color} />
          )}
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

export default CustomButton;

const useStyles = makeStyles((theme, props: Props) => ({
  buttonContainer: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: props?.primary
      ? AppColors.lightGrayPrimary
      : theme.colors.blueOpacity,
    borderRadius: 5,
    gap: 3,
  },
  button: {
    justifyContent: "center",
    alignContent: "center",
    padding: 1
  },
  buttonText: {
    color: props?.primary ? AppColors.darkBluePrimary : theme.colors.primary,
  },
}));
