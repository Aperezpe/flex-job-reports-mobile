import { StyleSheet } from "react-native";
import React from "react";
import SectionedClientsList from "./SectionedClientsList";
import { useClients } from "../../context/Client.ctx";
import EmptyClients from "./EmptyClients";

const ClientsList = () => {
  const { loading, clients, onEndReached } = useClients();

  return (
    <SectionedClientsList
      clients={clients}
      loading={loading}
      onEndReached={onEndReached}
      ListEmptyComponent={<EmptyClients />}
    />
  );
};

export default ClientsList;

const styles = StyleSheet.create({});
