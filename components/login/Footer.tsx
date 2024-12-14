import { StyleSheet, View } from "react-native";
import { useAuthScreenContext } from "../../context/AuthScreen.ctx";
import { Button, Text } from "@rneui/base";
import TextLink from "../TextLink";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";

const Footer = () => {
  const { inLoginPage } = useAuthScreenContext();

  return (
    <View style={styles.footer}>
      <PrefillButton />
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

const PrefillButton = () => {
  const { prefillCompanyAdminFormMock } = useAuthScreenContext();

  return (
    <Button onPress={prefillCompanyAdminFormMock}>Prefill Mock Form</Button>
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
  }
})