import { SectionList, SectionListData, StyleSheet, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigation, useRouter } from "expo-router";
import { useSupabaseREST } from "../../../../../context/SupabaseREST.ctx";
import { useSupabaseAuth } from "../../../../../context/SupabaseAuth.ctx";
import { AppDispatch } from "../../../../../store";
import { selectUserAndCompany } from "../../../../../store/selectors/userAndCompany.selector";
import { mapUserSQLToAppUser } from "../../../../../types/Auth/AppUser";
import { mapCompanySQLToCompany } from "../../../../../types/Company";
import { setAppCompany } from "../../../../../store/slices/appCompany.slice";
import { setAppUser } from "../../../../../store/slices/appUser.slice";
import { Button, Text } from "@rneui/themed";
import { globalStyles } from "../../../../../constants/GlobalStyles";
import AppSearchBar from "../../../../../components/AppSearchBar";
import dummyClientData from "../../../../../dummyClientData.json";
import { Client } from "../../../../../types/Client";
import ClientItem from "../../../../../components/clients/ClientItem";
import { AppColors } from "../../../../../constants/AppColors";
import TextLink from "../../../../../components/TextLink";
import { ScrollView } from "react-native-gesture-handler";

const Clients = () => {
  const { fetchUserWithCompany } = useSupabaseREST();
  const { authUser } = useSupabaseAuth();
  const navigation = useNavigation();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { appCompany } = useSelector(selectUserAndCompany);

  const [query, setQuery] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [sections, setSections] = useState<
    ReadonlyArray<SectionListData<Client, any>>
  >([]);
  const searchTimeout = 2500;

  useEffect(() => {
    const fetchClientData = () => {
      const res = dummyClientData;
      setClients(res);
      setSections(groupClientsByFirstLetter(res));
    };
    fetchClientData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: appCompany?.companyName ?? "",
      headerRight: () => <TextLink href="clients/add-client">Add</TextLink>,
    });
  }, [appCompany]);

  useEffect(() => {
    const fetchData = async (userId: string) => {
      const { data: userWithCompany, error } = await fetchUserWithCompany(
        userId
      );
      if (error) console.log("Error: ", error);

      if (userWithCompany && userWithCompany.company) {
        const user = {
          ...mapUserSQLToAppUser(userWithCompany),
          companyId: userWithCompany.company.id,
        };
        const company = mapCompanySQLToCompany(userWithCompany.company);

        dispatch(setAppCompany(company));
        dispatch(setAppUser(user));
      }
    };

    if (authUser) {
      fetchData(authUser.id);
    }
  }, []);

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => {
      console.log("searching...", query);
    }, searchTimeout);

    setTimeoutId(newTimeoutId);
  }, [query]);

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
    <ScrollView style={styles.container}>
      <Text style={[globalStyles.textTitle, styles.pagePadding]}>Clients</Text>
      <AppSearchBar
        containerStyle={{ paddingHorizontal: 10 }}
        placeholder="Search by name or address"
        onChangeText={setQuery}
        value={query}
      />

      <SectionList
        data={clients}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item }) => (
          <View style={styles.clientItemContainer}>
            <ClientItem
              client={item}
              onPress={() => router.push("clients/id")}
            />
          </View>
        )}
        sections={sections}
        scrollEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader]}>
            <Text style={[globalStyles.textSemiBold, styles.sectionHeaderText]}>
              {section.title}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default Clients;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
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
