import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import React from "react";
import { ListItem } from "@rneui/themed";
import { Client } from "../../types/Client";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";

type Props = {
  client: Client;
} & TouchableOpacityProps;

const ClientItem = ({ client, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ListItem>
        <ListItem.Content>
          <ListItem.Title style={globalStyles.textBold}>
            {client.clientName}
          </ListItem.Title>
          <ListItem.Subtitle
            style={[globalStyles.textRegular, styles.subtitle]}
          >
            {client.clientCompanyName}
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableOpacity>
  );
};

export default ClientItem;

const styles = StyleSheet.create({
  subtitle: {
    color: AppColors.primaryDarkGray,
  },
});
