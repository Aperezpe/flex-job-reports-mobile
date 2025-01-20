import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useClients } from "../../context/Client.ctx";
import SectionedClientsList from "./SectionedClientsList";
import ClientsNotFound from "./ClientsNotFound";
import { debounce } from "lodash";
import { globalStyles } from "../../constants/GlobalStyles";

const SearchClientsList = () => {
  const {
    loading,
    searchedClients,
    setSearchedClients,
    query,
    searchClientByNameOrAddress,
  } = useClients();

  const [typing, setTyping] = useState(false);

  const EmptyComponent = () => {
    if (!query && !searchedClients.length) return <View />; // Aqui puedo enseñar recent searches and results
    if (typing || loading)
      return (
        <View style={styles.searchingContainer}>
          <Text style={[globalStyles.textRegular]}>Search for {query}</Text>
        </View>
      );
    return <ClientsNotFound />;
  };

  const debouncedSearch = debounce((val: string) => {
    setTyping(false);
    searchClientByNameOrAddress(val);
  }, 800);

  useEffect(() => {
    if (query) {
      setTyping(true);
      debouncedSearch(query);
    } else {
      setSearchedClients([]);
    }
    return () => {
      debouncedSearch.cancel(); // Cancel the debounced function on unmount
    };
  }, [query]);

  return (
    <SectionedClientsList
      clients={searchedClients}
      loading={loading}
      query={query}
      typing={typing}
      ListEmptyComponent={EmptyComponent}
    />
  );
};

const styles = StyleSheet.create({
  searchingContainer: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchClientsList;
