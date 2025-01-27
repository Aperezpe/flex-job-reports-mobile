import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";
import { ClientAndAddresses } from "../../types/ClientAndAddresses";
import AddButton from "./AddButton";
import AddAddressFormModal from "./AddAddressFormModal";

type Props = {
  client: ClientAndAddresses | null;
  toggleModal: () => void;
  isAddressModalVisible: boolean;
  handleAddressSubmit: () => void;
};

const ClientDetailsHeader = ({ client, toggleModal, isAddressModalVisible }: Props) => {

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
        <Text style={[globalStyles.textSubTitle, styles.addressesTitle]}>
          Addresses
        </Text>
        <AddButton onPress={toggleModal}>Add Address</AddButton>
      </View>
      <AddAddressFormModal
        visible={isAddressModalVisible}
        onNegative={toggleModal}
        onPositive={toggleModal}
      />
    </View>
  );
};

export default ClientDetailsHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    color: AppColors.darkBluePrimary,
    fontSize: 22,
  },
  phone: {
    color: AppColors.darkBluePrimary,
  },
  addressesTitle: {
    color: AppColors.darkBluePrimary,
    fontSize: 20,
  },

  addressItem: {
    padding: 10,
  },
  addressText: {
    color: AppColors.darkBluePrimary,
  },
});
