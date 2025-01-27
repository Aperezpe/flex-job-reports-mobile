import { StyleSheet, View } from "react-native";
import { Text } from "@rneui/base";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import TextLink from "../TextLink";
import React from 'react';

const Footer = () => {
  const pathName = usePathname();
  const [inLoginPage, setInLoginPage] = useState(true);

  useEffect(() => {
    if (pathName === "/login") {
      setInLoginPage(true);
    } else setInLoginPage(false);
  }, [pathName]);

  return (
    <View style={styles.footer}>
      <View style={styles.loginOrRegisterContainer}>
        <Text style={[globalStyles.textRegular, styles.text]}>
          {inLoginPage
            ? `Don't have an account yet?`
            : `Already have an account?`}
          {"  "}
        </Text>
        <TextLink href={inLoginPage ? "register" : "login"}>
          {inLoginPage ? "Sign Up" : "Login"}
        </TextLink>
      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    gap: 10,
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
  },
  // Login or Register styles
  loginOrRegisterContainer: {
    flexDirection: "row",
  },
  text: {
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
});
