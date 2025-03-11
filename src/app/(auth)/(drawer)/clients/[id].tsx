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

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectClientDetails, selectClientDetailsError } from "../../../../redux/selectors/clientDetailsSelector";
import { Address } from "../../../../types/Address";
import useToggleModal from "../../../../hooks/useToggleModal";
import { removeClient } from "../../../../redux/actions/clientsActions";
import OptionsButton from "../../../../components/OptionsButton";
import { fetchClientById, resetClient } from "../../../../redux/actions/clientDetailsActions";
import ClientDetailsHeader from "../../../../components/client-details/ClientDetailsHeader";
import AddressCollapsible from "../../../../components/client-details/AddressCollapsible";
import AddressFormModal from "../../../../components/client-details/AddressFormModal";



const ClientDetails = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const client = useSelector(selectClientDetails);
  const error = useSelector(selectClientDetailsError);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | undefined>();
  const { visible, toggleModal } = useToggleModal();

  const toggleUpsertAddressModal = (address?: Address) => {
    toggleModal();
    setAddressToEdit(address);
  };

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
          toggleUpsertAddressModal({});
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

  useEffect(() => {
    if (error) Alert.alert(error);
  }, [error]);

  const handleAddressSubmit = () => {
    console.log("submit...?");
  };

  return (
    <>
      <FlatList
        style={styles.listContainer}
        data={client?.addresses}
        contentInsetAdjustmentBehavior={"automatic"}
        ListHeaderComponent={
          <ClientDetailsHeader
            client={client}
            toggleModal={toggleUpsertAddressModal}
            handleAddressSubmit={handleAddressSubmit}
          />
        }
        renderItem={({ item: address }) => (
          <AddressCollapsible
            address={address}
            toggleUpsertAddressModal={toggleUpsertAddressModal}
          />
        )}
      />
      <AddressFormModal
        visible={visible}
        onNegative={toggleUpsertAddressModal}
        onPositive={toggleUpsertAddressModal}
        address={addressToEdit}
      />
    </>
  );
};

export default ClientDetails;

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
});
