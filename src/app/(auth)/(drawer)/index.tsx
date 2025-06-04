import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectAppCompanyAndUser,
  selectLoadingSessionData,
} from "../../../redux/selectors/sessionDataSelectors";
import { Redirect, useRouter } from "expo-router";
import { Button, Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  selectUserJoinRequest,
  selectUserJoinRequestLoading,
} from "../../../redux/selectors/joinRequestSelector";
import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";
import { useDispatch } from "react-redux";
import { fetchUserJoinRequest } from "../../../redux/actions/joinRequestActions";
import LoadingComponent from "../../../components/LoadingComponent";

const LandingScreen = () => {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();
  const { isPendingTechnician } = useSelector(selectUserJoinRequest);
  const { isTechnicianOrAdmin, isNoCompanyUser, appUser } = useSelector(
    selectAppCompanyAndUser
  );
  // const loadingSessionData = useSelector(selectLoadingSessionData);
  const loadingUserJoinRequest = useSelector(selectUserJoinRequestLoading);

  if (isNoCompanyUser) return <Redirect href="/(drawer)/user-lobby" />;
  else if (isTechnicianOrAdmin) return <Redirect href="/(drawer)/clients" />;

  return (
    <SafeAreaView>
      <Text>There was an error in Landing Screen</Text>
      <Button onPress={signOut}>Signout</Button>
    </SafeAreaView>
  );
};

export default LandingScreen;
