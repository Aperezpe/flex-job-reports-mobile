import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { ListItem } from "@rneui/base";
import { globalStyles } from "../../../constants/GlobalStyles";
import { AppColors } from "../../../constants/AppColors";
import HighlightedText from "../../clients/HighlightedText";
import { TicketView } from "../../../types/Ticket";
import {
  extractJobReportFields,
} from "../../../utils/jobReportUtils";
import { JobReport, mapJobReport } from "../../../types/JobReport";
import { fetchJobReportByTicketIdApi } from "../../../api/jobReportApi";
import { useSelector } from "react-redux";
import { selectVisibleSystemTypes } from "../../../redux/selectors/sessionDataSelectors";
import ItemTile from "../../clients/ItemTile";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { fetchClientById } from "../../../redux/actions/clientDetailsActions";

type Props = {
  query?: string;
  ticket: TicketView;
  title?: string;
  subtitle?: string;
  tertiary?: string;
};

const TicketExpandableTile = ({ query = "", title = "", subtitle = "", tertiary = "", ticket }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [jobReports, setJobReports] = useState<JobReport[]>([]);
  const systemTypes = useSelector(selectVisibleSystemTypes);

  const onExpand = async () => {
    setExpanded(!expanded);
    try {
      if (!ticket?.id) throw Error("Ticket Id not fetched correctly");

      const { data, error } = await fetchJobReportByTicketIdApi(ticket.id);
      
      if (error) throw error;

      if (ticket?.clientId) dispatch(fetchClientById(ticket.clientId));
      else throw Error("There was an error fetching the client, try again")

      setJobReports(data?.map(mapJobReport) ?? []);
    } catch (e: any) {
      Alert.alert(
        e?.message ??
          `There was an error fetching job reports for this ticket: ${ticket?.id}`
      );
    }
  };

  const handleNavigateToReport = (jobReport?: JobReport) => {
    if (jobReport?.id)
      router.push({
        pathname: `modal/report`,
        params: {
          systemId: jobReport.systemId,
          jobReportId: jobReport.id,
          viewOnly: "true",
          presentationType: 'modal',
          headerLeftType: 'close'
        },
      });
  };

  return (
    <ListItem.Accordion
      content={
        <ListItem.Content>
          <View
            style={[
              globalStyles.row,
              {
                alignContent: "space-between",
                justifyContent: "space-between",
              },
            ]}
          >
            <ListItem.Title numberOfLines={1} style={[globalStyles.textBold]}>
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={title}
              />
            </ListItem.Title>
          </View>
          {subtitle && (
            <ListItem.Subtitle
              numberOfLines={1}
              style={[globalStyles.textRegular, styles.subtitle]}
            >
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={subtitle}
              />
            </ListItem.Subtitle>
          )}
          {tertiary && (
            <ListItem.Subtitle
              numberOfLines={1}
              style={[globalStyles.textRegular, styles.subtitle]}
            >
              <Text>{tertiary}</Text>
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
      }
      isExpanded={expanded}
      onPress={onExpand}
    >
      {jobReports.length > 0 &&
        jobReports.map((jobReport, index) => {
          const { systemArea } = extractJobReportFields(jobReport);
          return (
            <ItemTile
              key={index}
              containerStyle={{
                backgroundColor: AppColors.grayBackdrop,
                paddingLeft: 30,
              }}
              title={systemArea}
              subtitle={
                systemTypes.find(
                  (systemType) =>
                    systemType.id === jobReport.system?.systemTypeId
                )?.systemType ?? ""
              }
              onPress={() => handleNavigateToReport(jobReport)}
            />
          );
        })}
    </ListItem.Accordion>
  );
};

export default TicketExpandableTile;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
