import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import React from "react";
import { ListItem } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {} & TouchableOpacityProps;

const SystemTypeItem = ({ children, onPress }: Props) => {
  return (
    <View style={styles.clientItemContainer}>
      <TouchableOpacity onPress={onPress}>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title style={globalStyles.textBold}>
              {children}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </TouchableOpacity>
    </View>
  );
};

export default SystemTypeItem;

const styles = StyleSheet.create({
  clientItemContainer: {
    paddingHorizontal: 5,
  },
});
