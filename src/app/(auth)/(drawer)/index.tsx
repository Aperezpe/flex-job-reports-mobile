import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { useRouter } from "expo-router";
import { Button, Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";
import { useDispatch } from "react-redux";
import { fetchCompanyAndUser } from "../../../redux/actions/sessionDataActions";

const LandingScreen = () => {
  const { signOut, authUser } = useSupabaseAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isTechnicianOrAdmin, isNoCompanyUser, appUser } = useSelector(
    selectAppCompanyAndUser
  );

  useEffect(() => {
    if (authUser?.id && !appUser?.id) dispatch(fetchCompanyAndUser(authUser.id));

    if (appUser?.id && isNoCompanyUser) router.replace("/(drawer)/user-lobby");
    else if (appUser?.id && isTechnicianOrAdmin)router.replace("/(drawer)/clients");
    
  }, [authUser, appUser, isNoCompanyUser, isTechnicianOrAdmin])

  if (!authUser || !appUser) {
    return null;
  }

  return (
    <SafeAreaView>
      <Text>There was an error in Landing Screen</Text>
      <Button onPress={signOut}>Signout</Button>
    </SafeAreaView>
  );
};

export default LandingScreen;
