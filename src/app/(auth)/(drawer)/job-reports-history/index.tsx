import { FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";

import LoadingComponent from "../../../../components/LoadingComponent";
import { useFocusEffect, useRouter } from "expo-router";

import {
  fetchCompanyJobReportsHistory,
  resetCompanyJobReportsHistory,
  resetSearchCompanyJobReports,
  searchCompanyJobReports,
} from "../../../../redux/actions/jobReportActions";
import {
  selectCompanyJobReportsHistory,
  selectJobReportHistoryLoading,
  selectJobReportsHasMore,
  selectSearchedJobReportsHasMore,
  selectSearchedJobReportsHistory,
} from "../../../../redux/selectors/jobReportSelector";
import ReportHistoryItem from "../../../../components/client-details/reports-history/ReportHistoryItem";
import { Divider } from "@rneui/themed";
import { ReportHistoryAppBar } from "../../../../components/client-details/reports-history/ReportHistoryAppBar";
import {
  convertDateToISO,
  extractJobReportFields,
} from "../../../../utils/jobReportUtils";
import { JobReportView } from "../../../../types/JobReport";

const GlobalReportsHistory = () => {
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const loading = useSelector(selectJobReportHistoryLoading);
  const hasMore = useSelector(selectJobReportsHasMore);
  const router = useRouter();
  const companyJobReportsHistory = useSelector(selectCompanyJobReportsHistory);
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>();

  const searchedJobReports = useSelector(selectSearchedJobReportsHistory);
  const searchedHasMore = useSelector(selectSearchedJobReportsHasMore);

  const onEndReachedJobReports = () => {
    if (loading || !hasMore) return;
    if (appCompany?.id)
      dispatch(fetchCompanyJobReportsHistory({ companyId: appCompany?.id }));
  };

  const onEndReachedFilteredJobReports = () => {
    if (loading || !searchedHasMore) return;
    if (appCompany?.id)
      dispatch(searchCompanyJobReports({ companyId: appCompany?.id, query }));
  };

  const onEndReached = () => {
    if (isSearching) onEndReachedFilteredJobReports();
    else onEndReachedJobReports();
  };

  const onDateSubmitted = (date: Date | null) => {
    setSelectedDate(date);
    // If date is null, reset the filter
    if (!date && !query) {
      setIsSearching(false);
      dispatch(resetCompanyJobReportsHistory());
      dispatch(
        fetchCompanyJobReportsHistory({
          companyId: appCompany?.id ?? "",
        })
      );
      return;
    }

    dispatch(resetSearchCompanyJobReports());

    dispatch(
      searchCompanyJobReports({
        companyId: appCompany?.id ?? "",
        date: convertDateToISO(date),
        query,
      })
    );
    setIsSearching(true);
  };

  const handleSearch = (text: string) => {
    dispatch(resetSearchCompanyJobReports());

    if (appCompany?.id) {
      dispatch(
        searchCompanyJobReports({
          companyId: appCompany?.id ?? "",
          query: text.trim(),
          date: convertDateToISO(selectedDate),
        })
      );
    }
    setIsSearching(true);
    setQuery(text);
  };

  const handleCancelSearch = () => {
    if (!selectedDate) {
      setIsSearching(false);
      dispatch(resetSearchCompanyJobReports());
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (appCompany?.id) {
        dispatch(resetCompanyJobReportsHistory());
        dispatch(fetchCompanyJobReportsHistory({ companyId: appCompany?.id }));
      }
    }, [appCompany?.id, dispatch])
  );

  const handleNavigateToReport = (jobReport: JobReportView) => {
    router.push({
      pathname: `job-reports-history/${jobReport.id}`,
      params: {
        clientId: jobReport.clientId,
        systemId: jobReport.systemId,
        viewOnly: "true",
      },
    });
  };

  return (
    <>
      <ReportHistoryAppBar
        onDateSubmitted={onDateSubmitted}
        onSearch={handleSearch}
        onCancelSearch={handleCancelSearch}
      />
      <FlatList
        data={isSearching ? searchedJobReports : companyJobReportsHistory}
        renderItem={({ item: jobReport }) => {
          const { streetAddress, date, clientName } =
            extractJobReportFields(jobReport);
          return (
            <ReportHistoryItem
              query={query}
              title={clientName || ""}
              subtitle={streetAddress}
              tertiaryText={date}
              onPress={() => handleNavigateToReport(jobReport)}
            />
          );
        }}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={loading ? <LoadingComponent /> : null}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        keyExtractor={(item: JobReportView) => item.id}
      />
    </>
  );
};

export default GlobalReportsHistory;
