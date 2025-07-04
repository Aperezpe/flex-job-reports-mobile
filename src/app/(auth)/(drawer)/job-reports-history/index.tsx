import { FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";

import LoadingComponent from "../../../../components/LoadingComponent";
import { useFocusEffect } from "expo-router";

import {
  fetchCompanyTickets,
  resetCompanyTickets,
  resetSearchCompanyTickets,
  searchCompanyTickets,
} from "../../../../redux/actions/jobReportActions";
import {
  selectCompanyTickets,
  selectSearchedTickets,
  selectSearchedTicketsHasMore,
  selectTicketsHasMore,
  selectTicketsLoading,
} from "../../../../redux/selectors/jobReportSelector";
import TicketExpandableTile from "../../../../components/client-details/reports-history/TicketExpandableTile";
import { Divider } from "@rneui/themed";
import { ReportHistoryAppBar } from "../../../../components/client-details/reports-history/ReportHistoryAppBar";
import {
  constructTicketData,
  convertDateToISO,
} from "../../../../utils/jobReportUtils";
import { TicketView } from "../../../../types/Ticket";

const GlobalReportsHistory = () => {
  const { appCompany } = useSelector(selectAppCompanyAndUser);
  const dispatch = useDispatch();

  const loading = useSelector(selectTicketsLoading);

  const companyTickets = useSelector(selectCompanyTickets);
  const hasMore = useSelector(selectTicketsHasMore);

  const [selectedDate, setSelectedDate] = useState<Date | null>();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchedTickets = useSelector(selectSearchedTickets);
  const searchedHasMore = useSelector(selectSearchedTicketsHasMore);

  const onEndReachedJobReports = () => {
    if (loading || !hasMore) return;
    if (appCompany?.id)
      dispatch(fetchCompanyTickets({ companyId: appCompany?.id }));
  };

  const onEndReachedFilteredJobReports = () => {
    if (loading || !searchedHasMore) return;
    if (appCompany?.id)
      dispatch(
        searchCompanyTickets({
          companyId: appCompany?.id,
          query,
          date: selectedDate ? convertDateToISO(selectedDate) : "",
        })
      );
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
      dispatch(resetCompanyTickets());
      dispatch(
        fetchCompanyTickets({
          companyId: appCompany?.id ?? "",
        })
      );
      return;
    }

    dispatch(resetSearchCompanyTickets());

    dispatch(
      searchCompanyTickets({
        companyId: appCompany?.id ?? "",
        date: convertDateToISO(date),
        query,
      })
    );
    setIsSearching(true);
  };

  const handleSearch = (text: string) => {
    dispatch(resetSearchCompanyTickets());

    if (appCompany?.id) {
      dispatch(
        searchCompanyTickets({
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
      setQuery("");
      dispatch(resetSearchCompanyTickets());
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (appCompany?.id) {
        dispatch(resetCompanyTickets());
        dispatch(fetchCompanyTickets({ companyId: appCompany.id }));
      }
    }, [appCompany?.id, dispatch])
  );

  return (
    <>
      <ReportHistoryAppBar
        onDateSubmitted={onDateSubmitted}
        onSearch={handleSearch}
        onCancelSearch={handleCancelSearch}
      />
      <FlatList
        data={isSearching ? searchedTickets : companyTickets}
        renderItem={({ item: ticket }) => {
          const { clientName, addressString, ticketDate } =
            constructTicketData(ticket);
          return (
            <TicketExpandableTile
              query={query}
              ticket={ticket}
              title={clientName}
              subtitle={addressString}
              tertiary={ticketDate}
            />
          );
        }}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={loading ? <LoadingComponent /> : null}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        keyExtractor={(item: TicketView) => `${item.id}`}
      />
    </>
  );
};

export default GlobalReportsHistory;
