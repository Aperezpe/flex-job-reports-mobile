import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import { useClients } from "../../../../../context/Client.ctx";
import { useLocalSearchParams, useNavigation } from "expo-router";
import OptionsButton from "../../../../../components/OptionsButton";
import { AppColors } from "../../../../../constants/AppColors";
import { Entypo } from "@expo/vector-icons";
import AddAddressButton from "../../../../../components/clients/AddAddressButton";
import AddAddressFormModal from "../../../../../components/clients/AddAddressFormModal";

export type ClientProps = {};

const ClientDetails = (props: ClientProps) => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [isAddressModalActive, setIsAddressModalActive] = useState(false);
  const { fetchClientById, client, resetClient } = useClients();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <OptionsButton onPress={() => console.log("Perform Action")} />
      ),
    });
  }, []);

  useEffect(() => {
    if (typeof id == "string") fetchClientById(id);
    return () => resetClient();
  }, [id]);

  const toggleModal = () => setIsAddressModalActive(!isAddressModalActive);

  return (
    <View style={styles.container}>
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
        <AddAddressButton onPress={toggleModal} />
      </View>
      <AddAddressFormModal visible={isAddressModalActive} onNegative={toggleModal} />
    </View>
  );
};

export default ClientDetails;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  header: {
    paddingHorizontal: 5,
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
});
