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
import HighlightedText from "./HighlightedText";

type Props = {
  // client: Client;
  query?: string;
  title: string;
  subtitle?: string;
} & TouchableOpacityProps;

const ItemTile = ({
  // client,
  query = "",
  onPress,
  title,
  subtitle,
  // children
}: Props) => {
  return (
    <View style={styles.clientItemContainer}>
      <TouchableOpacity onPress={onPress}>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title style={globalStyles.textBold}>
              <HighlightedText
                highlightStyle={{ backgroundColor: "yellow" }}
                searchWords={[query]}
                textToHighlight={title}
                // textToHighlight={client.clientName ?? ""}
              />
            </ListItem.Title>
            {subtitle && (
              <ListItem.Subtitle
                style={[globalStyles.textRegular, styles.subtitle]}
              >
                <HighlightedText
                  highlightStyle={{ backgroundColor: "yellow" }}
                  searchWords={[query]}
                  textToHighlight={subtitle}
                  // textToHighlight={`${
                  // client.addresses?.[0]?.addressString ?? "No address yet"
                  // }`}
                />
              </ListItem.Subtitle>
            )}
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </TouchableOpacity>
    </View>
  );
};

export default ItemTile;

const styles = StyleSheet.create({
  clientItemContainer: {
    paddingHorizontal: 5,
  },
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
