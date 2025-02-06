import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import React, { PropsWithChildren } from "react";
import { Entypo } from "@expo/vector-icons";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import { TouchableOpacityProps } from "react-native-gesture-handler";

type Props = {
  buttonStyles?: StyleProp<ViewStyle>;
  textColor?: string;
} & TouchableOpacityProps & PropsWithChildren;

const AddButton = ({ onPress, children, buttonStyles, textColor = AppColors.bluePrimary }: Props) => {
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.row, styles.buttonContainer, buttonStyles]}
    >
      <Entypo name="plus" size={18} color={textColor} />
      <Text
        style={[globalStyles.textSemiBold, { color: textColor }]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default AddButton;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.blueOpacity,
    borderRadius: 5,
    gap: 3,
  },
  textStyle: {
    color: AppColors.bluePrimary,
  }
});
