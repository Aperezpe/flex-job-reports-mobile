import {
  ActivityIndicator,
  SectionList,
  SectionListData,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useSupabaseREST } from "../../../../../context/SupabaseREST.ctx";
import { Text } from "@rneui/themed";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import AppSearchBar from "../../../../../components/AppSearchBar";
import {
  Client,
  ClientSQL,
  mapClientSQLToClient,
} from "../../../../../types/Client";
import ClientItem from "../../../../../components/clients/ClientItem";
import { AppColors } from "../../../../../constants/AppColors";
import TextLink from "../../../../../components/TextLink";
import EmptyClients from "../../../../../components/clients/EmptyClients";
import useAsync from "../../../../../hooks/useAsyncCallback";
import useCompanyAndUserStorage from "../../../../../hooks/useCompanyAndUserStorage";
import Animated from "react-native-reanimated";
import useSectionListHeaderAnimation from "../../../../../hooks/useSectionListHeaderAnimation";

const Clients = () => {
  const { fetchClients, fetchClientByNameOrAddress } = useSupabaseREST();
  const { loading, asyncWrapper } = useAsync();
  const navigation = useNavigation();
  const router = useRouter();

  const { appCompany } = useCompanyAndUserStorage();

  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Client[] | null>(null);
  const [sections, setSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);

  const { onScroll, animatedHeaderStyle, animatedContainerStyle } =
    useSectionListHeaderAnimation();

  const updateListState = (clients: ClientSQL[]) => {
    const clientsRes = clients.map((client) => mapClientSQLToClient(client));
    setClients(clientsRes);
    setSections(groupClientsByFirstLetter(clientsRes));
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: appCompany?.companyName ?? "",
      headerRight: () => <TextLink href="clients/add-client">Add</TextLink>,
    });

    const fetchClientData = async () => {
      asyncWrapper(async () => {
        const { data, error } = await fetchClients();
        if (error) throw error;
        updateListState(data);
      });
    };

    if (appCompany) {
      fetchClientData();
    }
  }, [appCompany]);

  const handleQueryUpdate = useCallback((newValue: string) => {
    setQuery(newValue);
  }, []);

  const handleSearch = (query: string) => {
    asyncWrapper(async () => {
      const { data, error } = await fetchClientByNameOrAddress(query);
      if (error) throw error;
      updateListState(data);
    });
  };

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
    const sections = Object.keys(groupedClients)
      .sort()
      .map((letter) => ({
        title: letter,
        data: groupedClients[letter],
      }));

    return sections;
  };

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
          onChangeText={handleQueryUpdate}
          onSearch={handleSearch}
        />
      </Animated.View>

      {loading ? (
        <ActivityIndicator style={styles.loadingComponent} />
      ) : (
        <SectionList
          sections={sections} // Assuming `sections` is an array of objects with `title` and `data` properties.
          data={clients} // Make sure `clients` fits the structure expected by the SectionList
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
          ListEmptyComponent={EmptyClients}
        />
      )}
    </Animated.View>
  );
};

export default Clients;

const styles = StyleSheet.create({
  container: {
    flex: 1
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
