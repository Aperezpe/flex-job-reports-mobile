import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AppColors } from "../../constants/AppColors";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { TouchableWithoutFeedbackProps } from "react-native";
import {
  ButtonState,
  useClientTabContext,
} from "../../context/ClientTabContext";
import { globalStyles } from "../../constants/GlobalStyles";

const TabButton = () => {
  const { buttonState, onDefaultPress, onCancelPress, onStartPress } =
    useClientTabContext();

  const buttonStyle: Record<
    ButtonState,
    TouchableWithoutFeedbackProps["style"]
  > = {
    [ButtonState.DEFAULT]: {},
    [ButtonState.CANCEL]: {
      backgroundColor: AppColors.red2,
    },
    [ButtonState.START]: {
      paddingLeft: 3,
      backgroundColor: AppColors.success,
    },
  };
  const buttonIcon: Record<ButtonState, any> = {
    [ButtonState.DEFAULT]: (
      <FontAwesome6 name="receipt" size={32} color={AppColors.whitePrimary} />
    ),
    [ButtonState.CANCEL]: (
      <Ionicons name="close" size={42} color={AppColors.whitePrimary} />
    ),
    [ButtonState.START]: (
      <Text style={[globalStyles.textBold, styles.startText]}>START</Text>
    ),
  };
  const buttonAction: Record<ButtonState, (() => void) | undefined> = {
    [ButtonState.DEFAULT]: onDefaultPress,
    [ButtonState.CANCEL]: onCancelPress,
    [ButtonState.START]: onStartPress,
  };
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle[buttonState]]}
      onPress={buttonAction[buttonState]}
    >
      {buttonIcon[buttonState]}
    </TouchableOpacity>
  );
};

export default TabButton;

const styles = StyleSheet.create({
  button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: [{ translateX: -30 }], // half of width (60)
    backgroundColor: AppColors.bluePrimary,
    width: 65,
    height: 65,
    borderRadius: 25,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,

    // Shadow for Android
    elevation: 8,
  },
  startText: {
    color: AppColors.whitePrimary
  }
});
