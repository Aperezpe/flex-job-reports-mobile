import {
  ActivityIndicator,
  SectionList,
  SectionListData,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import useClients from "../../../../../hooks/useClients";
import { Text } from "@rneui/themed";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import AppSearchBar from "../../../../../components/AppSearchBar";
import { Client } from "../../../../../types/Client";
import ClientItem from "../../../../../components/clients/ClientItem";
import { AppColors } from "../../../../../constants/AppColors";
import TextLink from "../../../../../components/TextLink";
import EmptyClients from "../../../../../components/clients/EmptyClients";
import Animated from "react-native-reanimated";
import useSectionListHeaderAnimation from "../../../../../hooks/useSectionListHeaderAnimation";
import { useCompanyAndUser } from "../../../../../context/CompanyAndUser.ctx";

const Clients = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { appCompany } = useCompanyAndUser();
  const {
    loading,
    clients,
    searchedClients,
    page,
    setPage,
    fetchClients,
    searchClientByNameOrAddress,
    resetClients
  } = useClients();

  const [query, setQuery] = useState("");
  const [sections, setSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);

  const [searchedSections, setSearchedSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);

  const { onScroll, animatedHeaderStyle, animatedContainerStyle } =
    useSectionListHeaderAnimation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: appCompany?.companyName ?? "",
      headerRight: () => <TextLink href="clients/add-client">Add</TextLink>,
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

  const handleSearch = (query: string) => {
    if (clients === null) return;
    searchClientByNameOrAddress(query);
  };

  useEffect(() => {
    if (!query) resetClients()
  }, [query])

  return (
    <Animated.View style={[animatedContainerStyle, styles.container]}>
      <Animated.View style={[animatedHeaderStyle]}>
        <Text style={[globalStyles.textTitle, styles.pagePadding]}>
          Clients
        </Text>
        <AppSearchBar
          containerStyle={{ paddingHorizontal: 10 }}
          placeholder="Search by name or address"
          value={query}
          onChangeText={setQuery}
          onSearch={handleSearch}
        />
      </Animated.View>

      {(!clients && !query) || (!searchedClients && query) ? (
        <ActivityIndicator style={styles.loadingComponent} />
      ) : (
        <SectionList
          sections={query ? searchedSections :  sections} // Assuming `sections` is an array of objects with `title` and `data` properties.
          data={query ? searchedClients : clients} // Make sure `clients` fits the structure expected by the SectionList
          keyExtractor={(item, index) => `${index}-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.clientItemContainer}>
              <ClientItem
                client={item}
                onPress={() => router.push("clients/id")}
              />
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text
                style={[globalStyles.textSemiBold, styles.sectionHeaderText]}
              >
                {section.title}
              </Text>
            </View>
          )}
          onScroll={onScroll}
          onEndReached={() => setPage((prev) => prev + 1)}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={EmptyClients}
          ListFooterComponent={() =>
            loading && <ActivityIndicator style={styles.loadingComponent} />
          }
        />
      )}
    </Animated.View>
  );
};

export default Clients;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingComponent: {
    flex: 1,
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
});
