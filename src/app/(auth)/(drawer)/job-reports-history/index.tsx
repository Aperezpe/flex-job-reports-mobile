import { FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";


import LoadingComponent from "../../../../components/LoadingComponent";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";


import {
  fetchCompanyJobReportsHistory,
  filterCompanyJobReportHistory,
  resetCompanyJobReportsHistory,
} from "../../../../redux/actions/jobReportActions";
import {
  selectCompanyJobReportsHistory,
  selectFilteredJobReportsHistory,
  selectJobReportHistoryLoading,
  selectJobReportsHasMore,
} from "../../../../redux/selectors/jobReportSelector";
import ReportHistoryItem from "../../../../components/client-details/reports-history/ReportHistoryItem";
import { Divider } from "@rneui/themed";
import { ReportHistoryAppBar } from "../../../../components/client-details/reports-history/ReportHistoryAppBar";
import { convertDateToISO } from "../../../../utils/jobReportUitls";

const GlobalReportsHistory = () => {
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const loading = useSelector(selectJobReportHistoryLoading);
  const filteredJobReportsHistory = useSelector(
    selectFilteredJobReportsHistory
  );
  const hasMore = useSelector(selectJobReportsHasMore);
  const router = useRouter();
  const companyJobReportsHistory = useSelector(selectCompanyJobReportsHistory);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isFiltered, setIsFiltered] = useState(false);

  const onEndReached = () => {
    if (loading || !hasMore) return;
    if (appCompany?.id)
      dispatch(fetchCompanyJobReportsHistory({ companyId: appCompany?.id }));
  };

  const onDateSubmitted = (date: Date | null) => {
    // If date is null, reset the filter
    if (!date) {
      setIsFiltered(false);
      dispatch(resetCompanyJobReportsHistory());
      dispatch(
        fetchCompanyJobReportsHistory({
          companyId: appCompany?.id ?? "",
        })
      );
      return;
    }
    dispatch(
      filterCompanyJobReportHistory({
        companyId: appCompany?.id ?? "",
        date: convertDateToISO(date),
      })
    );
    setIsFiltered(true);
  };

  // Add an action in top bar
  useEffect(() => {
    navigation.setOptions({
      title: "Job Reports",
      header: () => <ReportHistoryAppBar onDateSubmitted={onDateSubmitted} />,
    });
  }, []);

  useEffect(() => {
    if (appCompany?.id) {
      dispatch(fetchCompanyJobReportsHistory({ companyId: appCompany?.id }));
    }
  }, [appCompany?.id, navigation, dispatch]);

  // Use `useFocusEffect` to re-fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (appCompany?.id) {
        dispatch(resetCompanyJobReportsHistory()); // Reset the job reports data
        dispatch(fetchCompanyJobReportsHistory({ companyId: appCompany?.id })); // Fetch the latest data
      }
    }, [appCompany?.id, dispatch])
  );

  return (
    <FlatList
      data={isFiltered ? filteredJobReportsHistory : companyJobReportsHistory}
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
      ListFooterComponent={loading ? <LoadingComponent /> : null}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      keyExtractor={(item) => item.id}
    />
  );
};

export default GlobalReportsHistory;