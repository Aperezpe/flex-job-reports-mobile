import React, { useEffect } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useNavigation, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchClientJobReportsHistory } from "../../../../../../redux/actions/jobReportActions";
import {
  selectJobReportHistoryLoading,
  selectJobReportsHistory,
  selectNewJobReportIdentified,
} from "../../../../../../redux/selectors/jobReportSelector";
import LoadingComponent from "../../../../../../components/LoadingComponent";
import ReportHistoryItem from "../../../../../../components/client-details/reports-history/ReportHistoryItem";
import { selectClientDetails } from "../../../../../../redux/selectors/clientDetailsSelector";
import { Divider } from "@rneui/base";

const ReportsHistory = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectJobReportHistoryLoading);
  const navigation = useNavigation();
  const router = useRouter();
  const client = useSelector(selectClientDetails);
  const jobReportsHistory = useSelector(selectJobReportsHistory);
  const newJobReportIdentified = useSelector(selectNewJobReportIdentified);

  useEffect(() => {
    navigation.setOptions({
      title: `${client?.clientName}'s Reports`,
    });

    if (client?.id || client?.id && newJobReportIdentified) {
      dispatch(fetchClientJobReportsHistory({ clientId: client.id }));
    }
  }, [newJobReportIdentified, client?.id, navigation, dispatch]);

  if (loading) return <LoadingComponent />;

  return (
    <FlatList
      data={jobReportsHistory}
      renderItem={({ item: jobReport }) => (
        <ReportHistoryItem
          jobReport={jobReport}
          onPress={() => {
            router.push({
              pathname: `clients/report/${jobReport.systemId}`,
              params: {
                jobReportId: jobReport.id, // send the report to view
                viewOnly: "true",
              },
            })
          }
          }
        />
      )}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={(item) => item.id}
    />
  );
};

export default ReportsHistory;
