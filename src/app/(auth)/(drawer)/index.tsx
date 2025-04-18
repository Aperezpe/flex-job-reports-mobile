import React from "react";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { Redirect } from "expo-router";
import { Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { selectUserJoinRequest } from "../../../redux/selectors/joinRequestSelector";

const LandingScreen = () => {
  const { isAllowedUser, isNoCompanyUser } = useSelector(
    selectAppCompanyAndUser
  );

  const { isPendingTechnician } = useSelector(selectUserJoinRequest)

  if (isPendingTechnician || isNoCompanyUser)
    return <Redirect href="/(drawer)/user-lobby" />;
  else if (isAllowedUser) return <Redirect href="/(drawer)/clients" />;

  return (
    <SafeAreaView>
      <Text>There was an error in Landing Screen</Text>
    </SafeAreaView>
  );
};

export default LandingScreen;
