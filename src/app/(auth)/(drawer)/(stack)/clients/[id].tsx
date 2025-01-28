import {
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  ActionSheetIOS,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import OptionsButton from "../../../../../components/OptionsButton";
import AddressCollapsible from "../../../../../components/client-details/AddressCollapsible";
import ClientDetailsHeader from "../../../../../components/client-details/ClientDetailsHeader";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectClientDetails } from "../../../../../redux/selectors/clientDetailsSelector";
import {
  fetchClientById,
  resetClient,
} from "../../../../../redux/actions/clientDetailsActions";
import { removeClient } from "../../../../../redux/actions/clientsActions";

const ClientDetails = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const client = useSelector(selectClientDetails);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [isAddressModalActive, setIsAddressModalActive] = useState(false);
  const toggleModal = () => setIsAddressModalActive(!isAddressModalActive);

  const handleRemoveConfirm = () => {
    if (id) {
      dispatch(removeClient(Number.parseInt(id.toString())));
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
      dispatch(fetchClientById(Number.parseInt(id)));
    }
    return () => {
      dispatch(resetClient());
    };
  }, [id]);

  // const handleSearch = (query: string) => {
  //   if (!client?.addresses?.length) return;
  //   console.log("searching for...", query);
  // };

  const handleAddressSubmit = () => {
    console.log("submit...?")
  }

  return (
    <FlatList
      style={styles.listContainer}
      data={client?.addresses}
      contentInsetAdjustmentBehavior={"automatic"}
      ListHeaderComponent={
        <ClientDetailsHeader
          client={client}
          toggleModal={toggleModal}
          isAddressModalVisible={isAddressModalActive}
          handleAddressSubmit={handleAddressSubmit}
        />
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
