

import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import ButtonText from "../../../../../components/ButtonText";
import SearchClientsList from "../../../../../components/clients/SearchClientsList";
import ClientsList from "../../../../../components/clients/ClientsList";
import AddClientFormModal from "../../../../../components/clients/AddClientFormModal";

const Clients = () => {
  const navigation = useNavigation();

  // const { setSearchedClients, setQuery } = useClients();

  const [isFocused, setIsFocused] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ButtonText onPress={() => setIsModalActive(!isModalActive)}>Add</ButtonText>
      ),
      headerSearchBarOptions: {
        placeholder: "Search by name or address",
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
        // onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) =>
          // setQuery(e.nativeEvent.text.trim()),
      },
    });
  }, []);


  return (
    <>
      {isFocused ? <SearchClientsList /> : <ClientsList />}

      <AddClientFormModal
        visible={isModalActive}
        setVisible={setIsModalActive}
      />
    </>
  );
};

export default Clients;