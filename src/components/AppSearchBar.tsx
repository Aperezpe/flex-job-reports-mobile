import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { debounce } from "lodash";
import ClearIcon from "./CustomIcons/ClearIcon";

// Define types for props
interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (query: string) => void; // Optional callback for custom search behavior
  containerStyle?: object; // Optional custom container style
  inputStyle?: object; // Optional custom input style
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  onSearch,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
}) => {
  // Debounce the search to avoid making unnecessary API calls or re-renders
  const debouncedSearch = debounce((query: string) => {
    if (onSearch) onSearch(query);
  }, 1500); // Debounce delay of 500ms

  useEffect(() => {
    // Call debouncedSearch whenever the input changes
    debouncedSearch(value);
    return () => {
      debouncedSearch.cancel(); // Cancel the debounced function on unmount
    };
  }, [value]);

  // Handle clearing the input
  const clearInput = () => onChangeText("");

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#888"
          returnKeyType="search"
          autoFocus={false}
        />
        {value.length > 0 && (
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

export default SearchBar;
