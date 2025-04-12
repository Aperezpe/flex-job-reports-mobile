import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRouter } from "expo-router";
import CloseButton from "../../../../components/CloseButton";
import LoadingComponent from "../../../../components/LoadingComponent";
import {
  fetchCompanyTechnicians,
  updateTechnicianStatus,
} from "../../../../redux/actions/techniciansActions";
import {
  selectPendingTechnicians,
  selectTechniciansLoading,
} from "../../../../redux/selectors/techniciansSelector";
import { globalStyles } from "../../../../constants/GlobalStyles";
import CustomButton from "../../../../components/CustomButton";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "../../../../constants/AppColors";
import { AppUser, UserStatus } from "../../../../types/Auth/AppUser";

const PendingTechnicians = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();
  const loadingTechnicians = useSelector(selectTechniciansLoading);
  const pendingTechnicians = useSelector(selectPendingTechnicians);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <CloseButton onPress={() => router.dismiss()} />,
    });

    dispatch(fetchCompanyTechnicians());
  }, [dispatch]);

  const handleAccept = (technicianId: string) => {
    Alert.alert(
      "Accept Technician",
      "Are you sure you want to accept this technician?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            dispatch(
              updateTechnicianStatus({
                technicianId,
                status: UserStatus.TECHNICIAN,
              })
            );
          },
        },
      ]
    );
  };

  const handleReject = (technicianId: string) => {
    Alert.alert(
      "Reject Technician",
      "Are you sure you want to reject this technician?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => {
            dispatch(
              updateTechnicianStatus({ technicianId, status: UserStatus.IDLE })
            );
          },
        },
      ]
    );
  };

  if (loadingTechnicians) {
    return <LoadingComponent />;
  }

  if (pendingTechnicians.length === 0) {
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
        keyExtractor={(technician: AppUser, index) =>
          `${technician.id}-${index}`
        }
        renderItem={({ item: technician }) => (
          <View style={[globalStyles.row, styles.technicianCard]}>
            <Text style={styles.technicianName}>{technician.fullName}</Text>
            <View style={{ flexGrow: 1 }} />
            <CustomButton
              buttonContainerStyle={{
                backgroundColor: AppColors.transparent,
              }}
              onPress={() => handleAccept(technician.id ?? "")}
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
              onPress={() => handleReject(technician.id ?? "")}
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
