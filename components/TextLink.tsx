import { StyleSheet } from "react-native";
import React, { PropsWithChildren } from "react";
import { globalStyles } from "../constants/GlobalStyles";
import { AppColors } from "../constants/AppColors";
import { Link, LinkProps } from "expo-router";

type TextLinkProps = {} & PropsWithChildren & LinkProps;

export default function TextLink({ children, href }: TextLinkProps) {
  return (
    <Link
      href={href}
      style={[globalStyles.textRegular, styles.text, styles.textLink]}
    >
      {children}
    </Link>
  );
}

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
