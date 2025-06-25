import React from "react";
import { useSelector } from "react-redux";
import {
  selectAppCompanyAndUser,
} from "../../../redux/selectors/sessionDataSelectors";
import { Redirect } from "expo-router";
import { Button, Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";


import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";

const LandingScreen = () => {
  const { signOut } = useSupabaseAuth();
  const { isTechnicianOrAdmin, isNoCompanyUser } = useSelector(
    selectAppCompanyAndUser
  );

  if (isNoCompanyUser) {
    console.log(`Redirected to user-lobby from LandingScreen because isNoCompanyUser is ${isNoCompanyUser}`)
    return <Redirect href="/(drawer)/user-lobby" />
  } else if (isTechnicianOrAdmin) return <Redirect href="/(drawer)/clients" />;

  return (
    <SafeAreaView>
      <Text>There was an error in Landing Screen</Text>
      <Button onPress={signOut}>Signout</Button>
    </SafeAreaView>
  );
};

export default LandingScreen;
