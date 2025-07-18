import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {
  number: number | null;
};

const CheckboxNumbered = ({ number }: Props) => {
  // console.log("number", number)
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: number
            ? AppColors.bluePrimary
            : AppColors.grayPlaceholder,
        },
      ]}
    >
      <Text
        style={[
          globalStyles.textBold,
          styles.text,
          { color: number ? AppColors.bluePrimary : AppColors.grayPlaceholder },
        ]}
      >
        {number ? number : ""}
      </Text>
    </View>
  );
};

export default CheckboxNumbered;

const CIRCLE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2.5,
    borderColor: AppColors.bluePrimary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    fontSize: 14,
    lineHeight: 17, // Ensures vertical centering
    textAlign: "center",
    color: AppColors.bluePrimary,
    fontWeight: "bold",
    includeFontPadding: false, // Android-specific
    paddingTop: 0.5, // small vertical correction
  },
});