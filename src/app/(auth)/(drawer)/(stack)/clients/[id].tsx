import { StyleSheet, FlatList, } from "react-native";
import React, { useEffect, useState } from "react";
import { useClients } from "../../../../../context/Client.ctx";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AppSearchBar from "../../../../../components/AppSearchBar";
import OptionsButton from "../../../../../components/OptionsButton";
import AddressCollapsible from "../../../../../components/client-details/AddressCollapsible";
import ClientDetailsHeader from "../../../../../components/client-details/ClientDetailsHeader";

export type ClientProps = {};

const ClientDetails = (props: ClientProps) => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { fetchClientById, client, resetClient } = useClients();
  const [query, setQuery] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <OptionsButton
          onPress={() => console.log("Perform Action")}
          type="circle"
        />
      ),
    });
  }, []);

  useEffect(() => {
    if (typeof id == "string") fetchClientById(id);
    return () => resetClient();
  }, [id]);

  const handleSearch = (query: string) => {
    if (!client?.addresses?.length) return;
    console.log("searching for...", query);
  };

  return (
    <FlatList
      style={styles.listContainer}
      data={client?.addresses}
      ListHeaderComponent={
        <>
          <ClientDetailsHeader client={client} />
          <AppSearchBar
            containerStyle={{ paddingHorizontal: 10 }}
            placeholder="Search addresses"
            onSearch={handleSearch}
            query={query}
          />
        </>
      }
      renderItem={({ item: address }) => (
        <AddressCollapsible address={address} />
      )}
    />
  );
};

export default ClientDetails;

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
});
