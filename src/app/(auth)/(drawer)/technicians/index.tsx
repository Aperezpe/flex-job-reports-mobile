import { Text, View, FlatList, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";
import {
  selectCompanyTechnicians,
  selectTechniciansLoading,
} from "../../../../redux/selectors/techniciansSelector";
import { fetchCompanyTechnicians } from "../../../../redux/actions/techniciansActions";
import LoadingComponent from "../../../../components/LoadingComponent";
import { AppUser } from "../../../../types/Auth/AppUser";

const Technicians = () => {
  const { appUser } = useSelector(selectAppCompanyAndUser);
  const dispatch = useDispatch();
  const loadingPendingTechnicians = useSelector(selectTechniciansLoading);
  const companyTechnicians = useSelector(selectCompanyTechnicians);
  const acceptedTechnicians = companyTechnicians.filter(
    (technician) => technician.status === "ACCEPTED"
  );

  useEffect(() => {
    const fetchPendingUsers = async () => {
      dispatch(fetchCompanyTechnicians());
    };

    fetchPendingUsers();
  }, [appUser?.companyId]);

  if (loadingPendingTechnicians) {
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
