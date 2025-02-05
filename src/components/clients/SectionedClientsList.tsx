import {
  ActivityIndicator,
  SectionList,
  SectionListData,
  Text,
  View,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Client, ClientSection } from "../../types/Client";
import ClientItem from "./ClientItem";
import { useRouter } from "expo-router";
import { globalStyles } from "../../constants/GlobalStyles";
import LoadingComponent from "../LoadingComponent";
import { FlatList } from "react-native-gesture-handler";
import { makeStyles } from "@rneui/themed";

type Props = {
  loading: boolean;
  clients: Client[] | null;
  query?: string;
  typing?: boolean;
  error?: string | null;
  onEndReached?: () => void;
  ListEmptyComponent?:
    | React.ComponentType
    | React.ReactElement
    | null
    | undefined;
};

const SectionedClientsList = ({
  clients,
  loading,
  onEndReached,
  query,
  error,
  ListEmptyComponent,
}: Props) => {
  const styles = useStyles();
  const [sections, setSections] = useState<
    ReadonlyArray<SectionListData<Client, ClientSection>>
  >([]);
  const router = useRouter();

  useLayoutEffect(() => {
    if (clients) setSections(groupClientsByFirstLetter(clients));
  }, [clients]);

  // Group clients by the first letter of their name
  const groupClientsByFirstLetter = (clients: Client[]): ClientSection[] => {
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

  if (error) {
    return (
      <FlatList
        data={[error]}
        renderItem={(item) => <Text>Error: {item.item}</Text>}
        contentInsetAdjustmentBehavior={"automatic"}
      />
    );
  }

  return (
    <SectionList
      data={clients}
      sections={sections}
      keyExtractor={(client: Client, index) =>
        `${index}-${client.id}`
      }
      renderItem={({ item: client }) => (
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
      )}
      contentInsetAdjustmentBehavior={"automatic"}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[globalStyles.textSemiBold, styles.sectionHeaderText]}>
            {section.title}
          </Text>
        </View>
      )}
      onEndReached={() => onEndReached?.()}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent }
      ListFooterComponent={() => loading && <LoadingComponent />}
    />
  );
};

export default SectionedClientsList;

const useStyles = makeStyles((theme) => ({
  sectionHeader: {
    backgroundColor: theme.colors.highlightOpacity,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    color: theme.colors.black
  },
}))

