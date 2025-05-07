import { StyleSheet } from "react-native";
import React from "react";
import { AppColors } from "../../constants/AppColors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  size: number;
};

const ClearIcon = ({ size = 16 }: Props) => {
  return <Ionicons name="close-circle-sharp" size={size} style={styles.icon} />;
};

export default ClearIcon;

const styles = StyleSheet.create({
  icon: {
    color: AppColors.primaryDarkGray,
  },
});
