import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
  ViewStyle,
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
  clickable?: boolean;
  LeftIcon?: React.ComponentType<any>;
  containerStyle?: StyleProp<ViewStyle>;
} & TouchableHighlightProps;

const ItemTile = ({
  query = "",
  onPress,
  title,
  subtitle,
  LeftIcon,
  clickable = true,
  containerStyle,
}: Props) => {
  const handlePress = (e: GestureResponderEvent) => {
    if (clickable) {
      onPress?.(e);
    }
    // else do nothing
  };
  return (
    <TouchableHighlight
      onPress={handlePress}
      underlayColor={clickable ? undefined : "transparent"}
    >
      <ListItem containerStyle={containerStyle}>
        {LeftIcon && <LeftIcon />}
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
        {clickable && <ListItem.Chevron />}
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
