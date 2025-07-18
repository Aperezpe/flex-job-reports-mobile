import { StyleSheet, Text } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import { TextProps } from "@rneui/base";

type Props = {} & TextProps;

const FieldTitle = ({ children, style }: Props) => {
  return (
    <Text
      style={[globalStyles.textBold, styles.fieldTitle, { paddingBottom: 5 }, style]}
    >
      {children}
    </Text>
  );
};

export default FieldTitle;

const styles = StyleSheet.create({
  fieldTitle: {
    fontSize: 18
  }
});
