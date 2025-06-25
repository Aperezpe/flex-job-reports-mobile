import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import React from "react";
import { ListItem } from "@rneui/base";
import { globalStyles } from "../../../constants/GlobalStyles";
import { AppColors } from "../../../constants/AppColors";
import HighlightedText from "../../clients/HighlightedText";

type Props = {
  query?: string;
  title: string;
  subtitle?: string;
  tertiaryText?: string;
  onPress: () => void;
};

const ReportHistoryItem = ({ query = "", title, subtitle, tertiaryText, onPress }: Props) => {
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
            <ListItem.Title
              numberOfLines={1}
              style={[globalStyles.textBold]}
            >
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
          {tertiaryText && <ListItem.Subtitle
            numberOfLines={1}
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            <Text>{tertiaryText}</Text>
          </ListItem.Subtitle>}
        </ListItem.Content>
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
