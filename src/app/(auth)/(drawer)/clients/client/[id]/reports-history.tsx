import React, { useEffect } from "react";
import { FlatList } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchClientTickets } from "../../../../../../redux/actions/jobReportActions";
import {
  selectClientTickets,
  selectNewTicketIdentified,
  selectTicketsLoading,
} from "../../../../../../redux/selectors/jobReportSelector";
import LoadingComponent from "../../../../../../components/LoadingComponent";
import TicketExpandableTile from "../../../../../../components/client-details/reports-history/TicketExpandableTile";
import { selectClientDetails } from "../../../../../../redux/selectors/clientDetailsSelector";
import { Divider } from "@rneui/base";
import { constructTicketData } from "../../../../../../utils/jobReportUtils";

const ReportsHistory = () => {
  const dispatch = useDispatch();
  const ticketsLoading = useSelector(selectTicketsLoading);
  const navigation = useNavigation();
  const client = useSelector(selectClientDetails);
  const clientTickets = useSelector(selectClientTickets);
  const newTicketIdentified = useSelector(selectNewTicketIdentified);

  useEffect(() => {
    navigation.setOptions({
      title: `${client?.clientName}'s Reports`,
    });

    if (client?.id || (client?.id && newTicketIdentified)) {
      dispatch(fetchClientTickets({ clientId: client.id }));
    }
  }, [newTicketIdentified, client?.id, navigation, dispatch]);

  if (ticketsLoading) return <LoadingComponent />;

  return (
    <FlatList
      data={clientTickets}
      renderItem={({ item: ticket }) => {
        const { addressString, ticketDate } = constructTicketData(ticket);
        return (
          <TicketExpandableTile
            title={addressString}
            subtitle={ticketDate}
            ticket={ticket}
          />
        );
      }}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={(item, index) => (item.id ?? index).toString()}
    />
  );
};

export default ReportsHistory;
