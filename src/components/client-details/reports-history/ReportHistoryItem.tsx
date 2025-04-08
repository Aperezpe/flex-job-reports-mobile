import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import { ListItem } from "@rneui/base";
import { globalStyles } from "../../../constants/GlobalStyles";
import { AppColors } from "../../../constants/AppColors";
import { JobReport } from "../../../types/JobReport";

type Props = {
  jobReport: JobReport;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const ReportHistoryItem = ({ jobReport, onPress, containerStyle }: Props) => {
  const jobReportInfo = jobReport.jobReport?.[0]?.fields;
  const jobReportAddressName = jobReportInfo?.find(
    (field: any) => field.name === "Address Name"
  )?.value;
  const jobReportSystemName = jobReportInfo?.find(
    (field: any) => field.name === "System Name"
  )?.value;
  const jobReportStreetAddress = jobReportInfo?.find(
    (field: any) => field.name === "Address"
  )?.value;

  const jobReportDate = new Date(jobReport?.updatedAt ?? "").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );


  return (
    <TouchableHighlight onPress={onPress}>
      <ListItem containerStyle={containerStyle}>
        <ListItem.Content>
          <View style={[globalStyles.row]}>
            <ListItem.Title style={globalStyles.textBold}>
              <Text>{jobReportAddressName}</Text>
            </ListItem.Title>
          </View>
          <ListItem.Subtitle
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            <Text>{jobReportDate}</Text>
          </ListItem.Subtitle>
          <ListItem.Subtitle
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            <Text>{jobReportStreetAddress}</Text>
          </ListItem.Subtitle>
        </ListItem.Content>
        <Text>{jobReportSystemName}</Text>
        <ListItem.Chevron />
      </ListItem>
    </TouchableHighlight>
  );
};

export default ReportHistoryItem;

const styles = StyleSheet.create({
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
