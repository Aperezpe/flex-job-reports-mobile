import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import ButtonText from "../../../../../components/ButtonText";
import { useClients } from "../../../../../context/Client.ctx";
import AddClientFormModal from "../../../../../components/clients/AddClientFormModal";
import SearchClientsList from "../../../../../components/clients/SearchClientsList";
import ClientsList from "../../../../../components/clients/ClientsList";

const Clients = () => {
  const navigation = useNavigation();

  const { setSearchedClients, setQuery } = useClients();

  const [isFocused, setIsFocused] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ButtonText onPress={() => setIsModalActive(true)}>Add</ButtonText>
      ),
      headerSearchBarOptions: {
        placeholder: "Search by name or address",
        hideWhenScrolling: true,
        placement: "stacked",
        onFocus: () => setIsFocused(true),
        onBlur: () => {
          setIsFocused(false);
          setSearchedClients([]);
        },
        onCancelButtonPress: () => {
          setIsFocused(false);
        },
        onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) =>
          setQuery(e.nativeEvent.text.trim()),
      },
    });
  }, []);

  return (
    <>
      {isFocused ? <SearchClientsList /> : <ClientsList />}

      <AddClientFormModal
        visible={isModalActive}
        onNegative={() => setIsModalActive(!isModalActive)}
      />
    </>
  );
};

export default Clients;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "red",
  },
  listHeader: {
    paddingHorizontal: 5,
    paddingVertical: 15,
  },
  pagePadding: {
    paddingHorizontal: 20,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
