import { StyleSheet } from "react-native";
import React, { PropsWithChildren } from "react";
import { globalStyles } from "../constants/GlobalStyles";
import { AppColors } from "../constants/AppColors";
import { Link, LinkProps } from "expo-router";
import { Text } from "@rneui/base";

type TextLinkProps = {
  bold?: boolean;
} & PropsWithChildren &
  LinkProps;

export const TextLink: React.FC<TextLinkProps> = ({ children, href, bold }) => {
  return (
    <Link href={href}>
      <Text
        style={[
          globalStyles.textRegular,
          styles.text,
          styles.textLink,
          bold ? globalStyles.textBold : null,
        ]}
      >
        {children}
      </Text>
    </Link>
  );
};

export default TextLink;

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
  textLink: {
    textDecorationStyle: "dashed",
    color: AppColors.bluePrimary,
  },
});
