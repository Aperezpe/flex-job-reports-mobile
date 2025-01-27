import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import SectionedClientsList from "./SectionedClientsList";
import ClientsNotFound from "./ClientsNotFound";
import { debounce } from "lodash";
import { globalStyles } from "../../constants/GlobalStyles";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { clearSearchedClients, searchClientByNameOrAddress } from "../../redux/actions/searchedClientsActions";
import { selectSearchedClients, selectSearchedClientsLoading } from "../../redux/selectors/searchedClientsSelector";

type Props = {
  query: string;
}

const SearchClientsList = ({ query }: Props) => {
  const dispatch = useDispatch();
  const searchedClients = useSelector(selectSearchedClients)
  const searchedClientsLoading = useSelector(selectSearchedClientsLoading);

  const [typing, setTyping] = useState(false);

  const EmptyComponent = () => {
    if (!query && !searchedClients.length) return <View />; // Aqui puedo enseñar recent searches and results
    if (typing || searchedClientsLoading)
      return (
        <View style={styles.searchingContainer}>
          <Text style={[globalStyles.textRegular]}>Search for {query}</Text>
        </View>
      );
    return <ClientsNotFound />;
  };

  const debouncedSearch = debounce((val: string) => {
    setTyping(false);
    dispatch(searchClientByNameOrAddress(val));
  }, 800);

  useEffect(() => {
    if (query) {
      setTyping(true);
      debouncedSearch(query);
    } else {
      dispatch(clearSearchedClients())
    }
    return () => {
      debouncedSearch.cancel(); // Cancel the debounced function on unmount
    };
  }, [query]);

  return (
    <SectionedClientsList
      clients={searchedClients}
      loading={searchedClientsLoading}
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
