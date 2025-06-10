import { Text, View, FlatList, StyleSheet, Alert } from "react-native";
import React, { useCallback, useEffect } from "react";
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
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import NotificationsButton from "../../../../components/technicians/NotificationsButton";
import { fetchCompanyJoinRequests } from "../../../../redux/actions/joinRequestActions";
import {
  selectCompanyJoinRequests,
  selectCompanyJoinRequestsError,
  selectCompanyJoinRequestsLoading,
} from "../../../../redux/selectors/joinRequestSelector";
import { fetchCompanyJobReportsHistory, resetCompanyJobReportsHistory } from "../../../../redux/actions/jobReportActions";
import {
  selectCompanyJobReportsHistory,
  selectJobReportHistoryLoading,
  selectJobReportsHasMore,
} from "../../../../redux/selectors/jobReportSelector";
import ReportHistoryItem from "../../../../components/client-details/reports-history/ReportHistoryItem";
import { Divider } from "@rneui/themed";

const GlobalReportsHistory = () => {
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const loading = useSelector(selectJobReportHistoryLoading);
  const hasMore = useSelector(selectJobReportsHasMore);
  const router = useRouter();
  const companyJobReportsHistory = useSelector(selectCompanyJobReportsHistory);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const onEndReached = () => {
    if (loading || !hasMore) return;
    if (appCompany?.id) dispatch(fetchCompanyJobReportsHistory(appCompany?.id));
  };

  useEffect(() => {
    if (appCompany?.id) {
      dispatch(fetchCompanyJobReportsHistory(appCompany?.id));
    }
  }, [appCompany?.id, navigation, dispatch]);

  // Use `useFocusEffect` to re-fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (appCompany?.id) {
        dispatch(resetCompanyJobReportsHistory()); // Reset the job reports data
        dispatch(fetchCompanyJobReportsHistory(appCompany?.id)); // Fetch the latest data
      }
    }, [appCompany?.id, dispatch])
  );

  return (
    <FlatList
      data={companyJobReportsHistory}
      renderItem={({ item: jobReport }) => (
        <ReportHistoryItem
          jobReport={jobReport}
          onPress={() => {
            router.push({
              pathname: `job-reports-history/${jobReport.id}`,
              params: {
                clientId: jobReport.clientId,
                systemId: jobReport.systemId,
                viewOnly: "true",
              },
            });
          }}
        />
      )}
      ItemSeparatorComponent={() => <Divider />}
      ListFooterComponent={ loading ? <LoadingComponent /> : null}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      keyExtractor={(item) => item.id}
    />
  );
};

export default GlobalReportsHistory;

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

// const ReportsHistory = () => {
//   const dispatch = useDispatch();
//   const loading = useSelector(selectJobReportHistoryLoading);
//   const navigation = useNavigation();
//   const router = useRouter();
//   const client = useSelector(selectClientDetails);
//   const jobReportsHistory = useSelector(selectJobReportsHistory);
//   const newJobReportIdentified = useSelector(selectNewJobReportIdentified);

//   useEffect(() => {
//     navigation.setOptions({
//       title: `${client?.clientName}'s Reports`,
//     });

//     if (client?.id || client?.id && newJobReportIdentified) {
//       dispatch(fetchClientJobReportsHistory({ clientId: client.id }));
//     }
//   }, [newJobReportIdentified, client?.id, navigation, dispatch]);

//   if (loading) return <LoadingComponent />;

//   return (
//     <FlatList
//       data={jobReportsHistory}
//       renderItem={({ item: jobReport }) => (
//         <ReportHistoryItem
//           jobReport={jobReport}
//           onPress={() => {
//             router.push({
//               pathname: "clients/report/[systemId]",
//               params: {
//                 systemId: jobReport.systemId,
//                 jobReportId: jobReport.id, // send the report to view
//                 viewOnly: "true",
//               },
//             })
//           }
//           }
//         />
//       )}
//       ItemSeparatorComponent={() => <Divider />}
//       keyExtractor={(item) => item.id}
//     />
//   );
// };

// export default ReportsHistory;
