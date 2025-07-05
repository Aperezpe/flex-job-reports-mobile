import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import CustomButton from "../CustomButton";
import { Client } from "../../types/Client";
import { makeStyles } from "@rneui/themed";
import { Entypo } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";

type Props = {
  client: Client | null;
  toggleModal: () => void;
};

const ClientDetailsHeader = ({ client, toggleModal }: Props) => {
  const styles = useStyles();

  return (
    <View>
      <View style={styles.header}>
        <Text style={[globalStyles.textTitle, styles.title]}>
          {client?.clientName ?? ""}
        </Text>
        <Text style={[globalStyles.textRegular, styles.phone]}>
          {client?.clientPhoneNumber ?? ""}
        </Text>
      </View>
      <View style={[styles.header, globalStyles.row]}>
        <Text style={[globalStyles.textTitleSemiBold, styles.addressesTitle]}>
          Addresses
        </Text>
        <CustomButton onPress={toggleModal}>
          <Entypo name="plus" size={18} color={AppColors.bluePrimary} />
          Add Address
        </CustomButton>
      </View>
    </View>
  );
};

export default ClientDetailsHeader;

const useStyles = makeStyles((theme) => ({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    color: theme.colors.black,
    fontSize: 22,
  },
  phone: {
    color: theme.colors.black,
  },
  addressesTitle: {
    color: theme.colors.black,
    fontSize: 20,
  },

  addressItem: {
    padding: 10,
  },
  addressText: {
    color: theme.colors.black,
  },
}));
