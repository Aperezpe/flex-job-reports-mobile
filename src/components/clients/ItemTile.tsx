import {
  StyleSheet,
  TouchableHighlight,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { ListItem } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import HighlightedText from "./HighlightedText";

type Props = {
  query?: string;
  title: string;
  subtitle?: string;
} & TouchableOpacityProps;

const ItemTile = ({ query = "", onPress, title, subtitle }: Props) => {
  return (
    <TouchableHighlight onPress={onPress}>
      <ListItem>
        <ListItem.Content>
          <ListItem.Title style={globalStyles.textBold}>
            <HighlightedText
              highlightStyle={{ backgroundColor: "yellow" }}
              searchWords={[query]}
              textToHighlight={title}
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
              />
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableHighlight>
  );
};

export default ItemTile;

const styles = StyleSheet.create({
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
