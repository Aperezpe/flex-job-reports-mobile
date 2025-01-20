import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import React from "react";
import { ListItem } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import HighlightedText from "./HighlightedText";

type Props = {
  client: ClientAndAddresses;
  query?: string;
} & TouchableOpacityProps;

const ClientItem = ({ client, query = "", onPress }: Props) => {
  return (
    <View style={styles.clientItemContainer}>
      <TouchableOpacity onPress={onPress}>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title style={globalStyles.textBold}>
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={client.clientName}
              />
            </ListItem.Title>
            <ListItem.Subtitle
              style={[globalStyles.textRegular, styles.subtitle]}
            >
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={`${
                  client.addresses?.[0]?.addressString ?? "No address yet"
                }`}
              />
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </TouchableOpacity>
    </View>
  );
};

export default ClientItem;

const styles = StyleSheet.create({
  clientItemContainer: {
    paddingHorizontal: 5,
  },
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
