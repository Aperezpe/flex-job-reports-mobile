import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "./CustomButton";
import { globalStyles } from "../constants/GlobalStyles";

type Props = {
  title: string;
  buttonText?: string;
  onActionPress?: () => void;
};

const EmptyList = ({ title, buttonText, onActionPress }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textSemiBold, styles.title]}>{title}</Text>
      <CustomButton primary onPress={onActionPress}>{buttonText}</CustomButton>
    </View>
  );
};

export default EmptyList;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    gap: 18,
    alignItems: "stretch",
    justifyContent: "center",
  },
  title: {
    textAlign: 'center'
  }
});
