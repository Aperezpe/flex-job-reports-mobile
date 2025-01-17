import {
  SectionList,
  SectionListData,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Text } from "@rneui/themed";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import AppSearchBar from "../../../../../components/AppSearchBar";
import { Client } from "../../../../../types/Client";
import ClientItem from "../../../../../components/clients/ClientItem";
import { AppColors } from "../../../../../constants/AppColors";
import EmptyClients from "../../../../../components/clients/EmptyClients";
import { useCompanyAndUser } from "../../../../../context/CompanyAndUser.ctx";
import ClientsNotFound from "../../../../../components/clients/ClientsNotFound";
import ButtonText from "../../../../../components/ButtonText";
import { useClients } from "../../../../../context/Client.ctx";
import AddClientFormModal from "../../../../../components/clients/AddClientFormModal";
import { ClientAndAddresses } from "../../../../../types/ClientAndAddresses";
import LoadingComponent from "../../../../../components/LoadingComponent";
import { SafeAreaView } from "react-native-safe-area-context";

const Clients = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { appCompany } = useCompanyAndUser();
  const {
    loading,
    clients,
    searchedClients,
    setSearchedClients,
    nextPage,
    searchClientByNameOrAddress,
  } = useClients();

  const [query, setQuery] = useState("");

  const [sections, setSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);

  const [isModalActive, setIsModalActive] = useState(false);

  const [searchedSections, setSearchedSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);

  const noSearchResults = !searchedClients?.length;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: appCompany?.companyName ?? "",
      headerRight: () => (
        <ButtonText onPress={() => setIsModalActive(true)}>Add</ButtonText>
      ),
    });
  }, [appCompany]);

  useLayoutEffect(() => {
    if (clients) setSections(groupClientsByFirstLetter(clients));
  }, [clients]);

  useLayoutEffect(() => {
    if (searchedClients)
      setSearchedSections(groupClientsByFirstLetter(searchedClients));
  }, [searchedClients]);

  // Group clients by the first letter of their name
  const groupClientsByFirstLetter = (clients: Client[]) => {
    const groupedClients: { [key: string]: Client[] } = {};

    clients.forEach((client) => {
      const firstLetter = client.clientName
        ? client.clientName[0].toUpperCase()
        : "";
      if (firstLetter) {
        if (!groupedClients[firstLetter]) {
          groupedClients[firstLetter] = [];
        }
        groupedClients[firstLetter].push(client);
      }
    });

    // Convert the groupedClients object into an array of sections
    const sections = Object.keys(groupedClients).map((letter) => ({
      title: letter,
      data: groupedClients[letter],
    }));

    return sections;
  };

  const handleSearch = (val: string) => {
    setQuery(val);
    
    if (!val) {
      console.log('resetting clients search')
      // Reset search when input is cleared
      setSearchedClients(null);
      return;
    }

    searchClientByNameOrAddress(val);
  };

  return (
    <SafeAreaView>
      <SectionList
        data={query ? searchedClients : clients}
        sections={query ? searchedSections : sections}

        keyExtractor={(client: ClientAndAddresses, index) =>
          `${index}-${client.id}`
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[globalStyles.textTitle, styles.pagePadding]}>
              Clients
            </Text>
            <AppSearchBar
              placeholder={"Search by name or address"}
              onSearch={handleSearch}
              query={query}
            />
          </View>
        }
        renderItem={({ item: client }) => (
          <View style={styles.clientItemContainer}>
            <ClientItem
              client={client}
              query={query}
              onPress={() =>
                router.push({
                  pathname: "/clients/[id]",
                  params: { id: client.id },
                })
              }
            />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[globalStyles.textSemiBold, styles.sectionHeaderText]}>
              {section.title}
            </Text>
          </View>
        )}
        scrollEnabled={!noSearchResults}
        onEndReached={() => (clients ? nextPage() : null)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => {
          if (query && noSearchResults && !loading) return <ClientsNotFound />;
          else if (!query && !searchedClients && !loading) return <EmptyClients />
          return <LoadingComponent />;
        }
        }
        ListFooterComponent={loading && !query ? <LoadingComponent /> : null}
      />
      <AddClientFormModal
        visible={isModalActive}
        onNegative={() => setIsModalActive(!isModalActive)}
      />
    </SafeAreaView>
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
    paddingVertical: 5,
  },
  pagePadding: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    backgroundColor: "#ececec",
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    color: AppColors.darkBluePrimary,
  },
  clientItemContainer: {
    paddingHorizontal: 5,
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
