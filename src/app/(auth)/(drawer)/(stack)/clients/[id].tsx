import {
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  ActionSheetIOS,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useClients } from "../../../../../context/ClientsContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AppSearchBar from "../../../../../components/AppSearchBar";
import OptionsButton from "../../../../../components/OptionsButton";
import AddressCollapsible from "../../../../../components/client-details/AddressCollapsible";
import ClientDetailsHeader from "../../../../../components/client-details/ClientDetailsHeader";
import {
  ClientDetailsProvider,
  useClientDetails,
} from "../../../../../context/ClientDetailsContext";

export type ClientProps = {};

const ClientDetails = (props: ClientProps) => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { fetchClientById, client, resetClient } = useClientDetails();
  const { removeClient } = useClients();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [isAddressModalActive, setIsAddressModalActive] = useState(false);
  const toggleModal = () => setIsAddressModalActive(!isAddressModalActive);

  const handleRemoveConfirm = () => {
    if (id) {
      removeClient(Number.parseInt(id.toString()));
      navigation.goBack();
    }
  };

  const onOptionsPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Add Address", "Delete Client"],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
        userInterfaceStyle: "light",
      },
      (buttonIndex) => {
        if (buttonIndex === 2) {
          Alert.alert("Are you sure?", "The client will be removed", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Confirm",
              onPress: handleRemoveConfirm,
              style: "destructive",
            },
          ]);
        } else if (buttonIndex === 1) {
          toggleModal();
        }
      }
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <OptionsButton onPress={onOptionsPress} type="circle" />
      ),
      headerSearchBarOptions: {
        placeholder: "Search address",
        hideWhenScrolling: true,
        placement: "stacked",
        onFocus: () => setIsFocused(true),
        onBlur: () => {
          setIsFocused(false);
          // setSearchedClients([]);
        },
        onCancelButtonPress: () => {
          setIsFocused(false);
        },
        onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) =>
          setQuery(e.nativeEvent.text.trim()),
      },
    });
  }, []);

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchClientById(id);
    }
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
      contentInsetAdjustmentBehavior={"automatic"}
      ListHeaderComponent={
        <>
          <ClientDetailsHeader
            client={client}
            toggleModal={toggleModal}
            isAddressModalVisible={isAddressModalActive}
          />
          {/* <AppSearchBar
            containerStyle={{ paddingHorizontal: 10 }}
            placeholder="Search addresses"
            onSearch={handleSearch}
            query={query}
          /> */}
        </>
      }
      renderItem={({ item: address }) => (
        <AddressCollapsible address={address} />
      )}
    />
  );
};

const ClientDetailsWrapper = () => {
  return (
    <ClientDetailsProvider>
      <ClientDetails />
    </ClientDetailsProvider>
  );
};

export default ClientDetailsWrapper;

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
});
