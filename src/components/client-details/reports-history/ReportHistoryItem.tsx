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
};

const ReportHistoryItem = ({ jobReport, onPress }: Props) => {
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
      <ListItem containerStyle={styles.container}>
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
            <ListItem.Title numberOfLines={1} style={[globalStyles.textBold, { width: '50%' }]}>
              <Text>{jobReportAddressName}</Text>
            </ListItem.Title>
          </View>
          <ListItem.Subtitle
            numberOfLines={1}
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            <Text>{jobReportDate}</Text>
          </ListItem.Subtitle>
          <ListItem.Subtitle
            numberOfLines={1}
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            <Text>{jobReportStreetAddress}</Text>
          </ListItem.Subtitle>
        </ListItem.Content>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            width: '35%',
            textAlign: "right",
            position: "absolute",
            top: 20,
            right: 45,
          }}
        >
          {jobReportSystemName}
        </Text>
        <ListItem.Chevron />
      </ListItem>
    </TouchableHighlight>
  );
};

export default ReportHistoryItem;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
