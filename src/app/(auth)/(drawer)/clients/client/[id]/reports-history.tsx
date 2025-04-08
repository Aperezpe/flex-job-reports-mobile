import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useLocalSearchParams, useNavigation } from "expo-router";
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

type Props = {};

const ReportsHistory = (props: Props) => {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const loading = useSelector(selectJobReportHistoryLoading);
  const navigation = useNavigation();
  const client = useSelector(selectClientDetails);
  const jobReportsHistory = useSelector(selectJobReportsHistory);
  const newJobReportIdentified = useSelector(selectNewJobReportIdentified);

  useEffect(() => {
    if (id && typeof id === "string" && newJobReportIdentified) {
      dispatch(fetchClientJobReportsHistory({ clientId: Number.parseInt(id) }));
    }
  }, [id, newJobReportIdentified]);

  useEffect(() => {
    navigation.setOptions({
      title: `${client?.clientName}'s Reports`,
    });
  }, []);

  if (loading) return <LoadingComponent />;

  return (
    <FlatList
      data={jobReportsHistory}
      renderItem={({ item: jobReport }) => (
        <ReportHistoryItem jobReport={jobReport} onPress={() => {}} />
      )}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={(item) => item.id}
    />
  );
};

export default ReportsHistory;

const styles = StyleSheet.create({});
