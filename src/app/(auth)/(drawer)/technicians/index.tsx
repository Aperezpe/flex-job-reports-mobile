import { Text, View, FlatList, StyleSheet, Alert } from "react-native";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";
import {
  selectAcceptedTechnicians,
  selectTechniciansError,
  selectTechniciansLoading,
} from "../../../../redux/selectors/techniciansSelector";
import { fetchCompanyTechnicians } from "../../../../redux/actions/techniciansActions";
import LoadingComponent from "../../../../components/LoadingComponent";
import { AppUser } from "../../../../types/Auth/AppUser";
import { useNavigation } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import NotificationsButton from "../../../../components/technicians/NotificationsButton";
import { fetchCompanyJoinRequests } from "../../../../redux/actions/joinRequestActions";
import {
  selectCompanyJoinRequests,
  selectCompanyJoinRequestsError,
  selectCompanyJoinRequestsLoading,
} from "../../../../redux/selectors/joinRequestSelector";

const Technicians = () => {
  const { appUser } = useSelector(selectAppCompanyAndUser);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const pendingJoinRequests = useSelector(selectCompanyJoinRequests);
  const pendingJoinRequestsLoading = useSelector(
    selectCompanyJoinRequestsLoading
  );
  const pendingJoinRequestError = useSelector(selectCompanyJoinRequestsError);
  const loadingPendingTechnicians = useSelector(selectTechniciansLoading);
  const acceptedTechnicians = useSelector(selectAcceptedTechnicians);
  const techniciansError = useSelector(selectTechniciansError);
  const isLoading = pendingJoinRequestsLoading || loadingPendingTechnicians;

  useEffect(() => {
    if (pendingJoinRequestError)
      Alert.alert(
        "Error",
        (pendingJoinRequestError as Error).message ||
          "Failed to fetch pending technicians"
      );
    else if (techniciansError) Alert.alert("Error", techniciansError);
  }, [techniciansError, pendingJoinRequestError]);

  useEffect(() => {
    navigation.setOptions({
      title: "Manage Technicians",
      headerLeft: () => <DrawerMenu />,
      headerRight: () => (
        <NotificationsButton notifications={pendingJoinRequests.length} />
      ),
    });
  }, [pendingJoinRequests.length]);

  useEffect(() => {
    if (appUser?.companyId) {
      dispatch(fetchCompanyJoinRequests());

      // Fetch technicians if companyId changes or pending join requests change
      dispatch(fetchCompanyTechnicians());
    }
  }, [appUser?.companyId, pendingJoinRequests.length]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (acceptedTechnicians.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUsersText}>
          No technicians have joined your company.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={acceptedTechnicians}
        keyExtractor={(technician: AppUser, index) =>
          `${index}-${technician.id}`
        }
        renderItem={({ item: technician }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{technician.fullName}</Text>
            <Text style={styles.userEmail}>{technician.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Technicians;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  noUsersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#555",
  },
});
