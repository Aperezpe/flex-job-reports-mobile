import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRouter } from "expo-router";
import CloseButton from "../../../../components/CloseButton";
import LoadingComponent from "../../../../components/LoadingComponent";
import { globalStyles } from "../../../../constants/GlobalStyles";
import CustomButton from "../../../../components/CustomButton";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "../../../../constants/AppColors";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";
import { JoinRequest } from "../../../../types/JoinRequest";
import {
  selectCompanyJoinRequests,
  selectCompanyJoinRequestsError,
  selectCompanyJoinRequestsLoading,
} from "../../../../redux/selectors/joinRequestSelector";
import {
  acceptJoinRequest,
  fetchCompanyJoinRequests,
  rejectJoinRequest,
} from "../../../../redux/actions/joinRequestActions";

const PendingTechnicians = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const pendingTechnicians = useSelector(selectCompanyJoinRequests);
  const pendingTechniciansLoading = useSelector(
    selectCompanyJoinRequestsLoading
  );
  const pendingTechniciansError = useSelector(selectCompanyJoinRequestsError);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <CloseButton onPress={() => router.dismiss()} />,
    });

    if (appCompany?.companyUID) dispatch(fetchCompanyJoinRequests());
  }, [dispatch, appCompany?.id]);

  useEffect(() => {
    if (pendingTechniciansError) {
      Alert.alert(
        "Error",
        (pendingTechniciansError as Error).message ||
          "Failed to fetch pending technicians"
      );
    }
  }, [pendingTechniciansError]);

  const handleAccept = (technicianId?: string) => {
    Alert.alert(
      "Accept Technician",
      "Are you sure you want to accept this technician?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => dispatch(acceptJoinRequest(technicianId)),
        },
      ]
    );
  };

  const handleReject = (technicianId?: string) => {
    Alert.alert(
      "Reject Technician",
      "Are you sure you want to reject this technician?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => dispatch(rejectJoinRequest(technicianId)),
        },
      ]
    );
  };

  if (pendingTechniciansLoading) {
    return <LoadingComponent />;
  }

  if (pendingTechnicians?.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTechniciansText}>
          No pending technicians found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingTechnicians}
        keyExtractor={(joinRequest: JoinRequest, index) =>
          `${joinRequest.id}-${index}`
        }
        renderItem={({ item: joinRequest }) => (
          <View style={[globalStyles.row, styles.technicianCard]}>
            <Text style={styles.technicianName}>{joinRequest.userName}</Text>
            <View style={{ flexGrow: 1 }} />
            <CustomButton
              buttonContainerStyle={{
                backgroundColor: AppColors.transparent,
              }}
              onPress={() => handleAccept(joinRequest?.userId)}
            >
              <AntDesign
                name="checkcircle"
                size={32}
                color={AppColors.success}
              />
            </CustomButton>
            <CustomButton
              buttonContainerStyle={{
                backgroundColor: AppColors.transparent,
              }}
              onPress={() => handleReject(joinRequest?.userId)}
            >
              <AntDesign name="closecircle" size={32} color={AppColors.red2} />
            </CustomButton>
          </View>
        )}
      />
    </View>
  );
};

export default PendingTechnicians;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  noTechniciansText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  technicianCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  technicianEmail: {
    fontSize: 14,
    color: "#555",
  },
});
