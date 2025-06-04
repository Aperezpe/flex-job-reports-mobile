import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { useAssets } from "expo-asset";
import { globalStyles } from "../../../constants/GlobalStyles";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { AppColors } from "../../../constants/AppColors";
import pendingTechnicianImage from "../../../assets/images/pending_technician.png";
import noCompanyUserImage from "../../../assets/images/technician_no_company.png";
import CustomButton from "../../../components/CustomButton";
import JoinCompanyModal from "../../../components/JoinCompanyModal";
import { useDispatch } from "react-redux";
import {
  selectUserJoinRequest,
  selectUserJoinRequestError,
  selectUserJoinRequestLoading,
} from "../../../redux/selectors/joinRequestSelector";
import {
  deleteUserJoinRequest,
  fetchUserJoinRequest,
} from "../../../redux/actions/joinRequestActions";
import LoadingComponent from "../../../components/LoadingComponent";
import { PGRST116 } from "../../../constants/ErrorCodes";
import { PostgrestError } from "@supabase/supabase-js";
import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";

const UserLobby = () => {
  const [assets, assetsError] = useAssets([
    pendingTechnicianImage,
    noCompanyUserImage,
  ]);
  const dispatch = useDispatch();
  const { session } = useSupabaseAuth();
  const { appUser, isNoCompanyUser } = useSelector(selectAppCompanyAndUser);
  const { userJoinRequest, isPendingTechnician } = useSelector(
    selectUserJoinRequest
  );
  const loading = useSelector(selectUserJoinRequestLoading);
  const error = useSelector(selectUserJoinRequestError);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => setIsModalVisible(!isModalVisible);

  useEffect(() => {
    const postgrestError = error as PostgrestError;
    // PGRST116 indicates "No user found", meaning the user has not submitted any requests.
    if (error && postgrestError.code !== PGRST116) {
      // setIsNoCompanyUser(true);
      Alert.alert("Error", postgrestError.message || "Error getting user data");
    }
  }, [error]);

  const handleCancelRequest = () => {
    // dispatch event to delete record in join_requests table for that user
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel your request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Cancel Request",
          onPress: () =>
            appUser?.id &&
            dispatch(
              deleteUserJoinRequest({ userId: appUser.id, token: session?.access_token || "" })
            ),
        },
      ]
    );
  };

  if (loading) return <LoadingComponent />;

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textTitle, styles.textTitle]}>
        {isPendingTechnician
          ? "Your request has been sent!"
          : "You have no company!"}
      </Text>

      {assetsError && (
        <Text style={{ color: "red", marginVertical: 10 }}>
          Failed to load image.
        </Text>
      )}

      {assets && (
        <Image
          source={isPendingTechnician ? assets[0] : assets[1]}
          style={styles.image}
          alt="pending technician"
          contentFit="contain"
          transition={500}
        />
      )}
      <Text style={[globalStyles.textRegular, styles.textRegular]}>
        {isPendingTechnician
          ? `Waiting for "${userJoinRequest?.companyUid}" to accept your request.`
          : "You can start by joining a company."}
      </Text>
      <CustomButton
        primary={isPendingTechnician}
        buttonContainerStyle={[
          styles.buttonContainerStyle,
          isPendingTechnician ? null : styles.blueButton,
        ]}
        buttonTextStyle={isPendingTechnician ? null : styles.blueButton}
        onPress={isPendingTechnician ? handleCancelRequest : toggleModal}
      >
        {isPendingTechnician ? "Cancel Request" : "Join a Company"}
      </CustomButton>
      <JoinCompanyModal
        visible={isModalVisible}
        onNegative={toggleModal}
        onPositive={toggleModal}
      />
    </View>
  );
};

export default UserLobby;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 35,
  },
  textTitle: {
    fontSize: 20,
    textAlign: "center",
  },
  image: {
    flexGrow: 1,
    width: 225,
    height: 225,
  },
  textRegular: {
    textAlign: "center",
    color: AppColors.darkGray,
  },
  buttonContainerStyle: {
    width: "100%",
    padding: 4,
    marginTop: 25,
  },
  blueButton: {
    backgroundColor: AppColors.bluePrimary,
    color: AppColors.whitePrimary,
  },
});
