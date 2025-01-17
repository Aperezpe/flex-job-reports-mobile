import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ViewProps, LayoutChangeEvent } from "react-native";
import { debounce } from "lodash";
import ClearIcon from "./CustomIcons/ClearIcon";

// Define types for props
export interface SearchBarProps {
  placeholder: string;
  query: string;
  // setQuery: React.Dispatch<React.SetStateAction<string>>;
  onSearch?: (query: string) => void; // Optional callback for custom search behavior
  containerStyle?: object; // Optional custom container style
  inputStyle?: object; // Optional custom input style
}

const AppSearchBar = ({
  placeholder,
  onSearch,
  query,
  // setQuery,
  containerStyle = { paddingHorizontal: 10 },
  inputStyle,
}: SearchBarProps) => {
  const [value, setValue] = useState(query);
  // const [query, setQuery] = useState("");

  // Debounce the search to avoid making unnecessary API calls or re-renders
  const debouncedSearch = debounce((val: string) => {
    if (onSearch) { onSearch(val); }
  }, 1500); // Debounce delay of 500ms

  useEffect(() => {
    // Call debouncedSearch whenever the input changes
    debouncedSearch(value);
    return () => {
      debouncedSearch.cancel(); // Cancel the debounced function on unmount
    };
  }, [value]);

  // Handle clearing the input
  const clearInput = () => setValue("");

  return (
    <View style={[styles.container, containerStyle]} >
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          placeholderTextColor="#888"
          returnKeyType="search"
          autoFocus={false}
        />
        {query?.length > 0 && (
          <TouchableOpacity onPress={clearInput}>
            <ClearIcon size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 35,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 10,
  },
  clearText: {
    fontSize: 16,
    color: "#888",
  },
});

export default AppSearchBar;