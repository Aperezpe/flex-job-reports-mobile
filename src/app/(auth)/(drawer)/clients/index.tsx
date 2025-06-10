import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import ButtonText from "../../../../components/ButtonText";
import SearchClientsList from "../../../../components/clients/SearchClientsList";
import ClientsList from "../../../../components/clients/ClientsList";
import AddClientFormModal from "../../../../components/clients/AddClientFormModal";
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";
import { useSelector } from "react-redux";
import {
  selectUserJoinRequestLoading,
} from "../../../../redux/selectors/joinRequestSelector";
import {
  selectAppCompanyAndUser,
} from "../../../../redux/selectors/sessionDataSelectors";

const Clients = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [isFocused, setIsFocused] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  const { isTechnicianOrAdmin } = useSelector(
    selectAppCompanyAndUser
  );
  const loadingUserJoinRequest = useSelector(selectUserJoinRequestLoading);

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
        },
        onCancelButtonPress: () => {
          setIsFocused(false);
        },
        onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) =>
          setQuery(e.nativeEvent.text.trim()),
      },
    });

    // // Ensures that if the user is pending technician or has no company,
    // // they are redirected to the user lobby.
    // if (isPendingTechnician || isPendingTechnician) {
    //   router.replace("/(drawer)/user-lobby");
    // }
  }, []);

  useEffect(() => {
    if (!isTechnicianOrAdmin && !loadingUserJoinRequest) {
      router.replace("/(drawer)/user-lobby");
    }
  }, [isTechnicianOrAdmin, !loadingUserJoinRequest]);

  return (
    <>
      {isFocused || query ? (
        <SearchClientsList query={query} />
      ) : (
        <ClientsList setIsModalActive={setIsModalActive} />
      )}

      <AddClientFormModal
        visible={isModalActive}
        setVisible={setIsModalActive}
      />
    </>
  );
};

export default Clients;
