import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import ButtonText from "../../../../../components/ButtonText";
import SearchClientsList from "../../../../../components/clients/SearchClientsList";
import ClientsList from "../../../../../components/clients/ClientsList";
import AddClientFormModal from "../../../../../components/clients/AddClientFormModal";
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";
import { useDispatch } from "react-redux";
import { clearSearchedClients } from "../../../../../redux/actions/searchedClientsActions";

const Clients = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");

  const [isFocused, setIsFocused] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ButtonText onPress={() => setIsModalActive(!isModalActive)}>
          Add
        </ButtonText>
      ),
      headerSearchBarOptions: {
        placeholder: "Search by name or address",
        hideWhenScrolling: true,
        placement: "stacked",
        onFocus: () => setIsFocused(true),
        onBlur: () => {
          setIsFocused(false);
          dispatch(clearSearchedClients());
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
      {isFocused ? <SearchClientsList query={query} /> : <ClientsList />}

      <AddClientFormModal
        visible={isModalActive}
        setVisible={setIsModalActive}
      />
    </>
  );
};

export default Clients;
