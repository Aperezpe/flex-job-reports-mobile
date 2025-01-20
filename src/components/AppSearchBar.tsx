import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { debounce } from "lodash";
import ClearIcon from "./CustomIcons/ClearIcon";
import { SearchBarBaseProps } from "@rneui/base/dist/SearchBar/types";
import { TextInputRef } from "./Inputs/CustomInput";

// Define types for props
export interface SearchBarProps extends SearchBarBaseProps {
  onSearch?: (query: string) => void; // Optional callback for custom search behavior
  inputStyle?: object; // Optional custom input style
  onFocus: () => void;
  onBlur: () => void;
}

const AppSearchBar = forwardRef<TextInputRef, SearchBarProps>(
  (props, ref) => {
    const {
      onSearch,
      inputStyle,
      onBlur,
      onFocus,
      autoFocus = false,
      placeholder,
    } = props;

    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const textInputRef = useRef<TextInput | null>(null);

    // Debounce the search to avoid making unnecessary API calls or re-renders
    const debouncedSearch = debounce((val: string) => {
      if (onSearch) {
        onSearch(val);
      }
    }, 1500); // Debounce delay of 500ms

    useEffect(() => {
      // Call debouncedSearch whenever the input changes
      debouncedSearch(query);
      return () => {
        debouncedSearch.cancel(); // Cancel the debounced function on unmount
      };
    }, [query]);

    // Use useImperativeHandle to expose custom methods to the parent
    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (textInputRef.current) {
          onInputFocus()
        }
      },
      blurInput: () => {
        if (textInputRef.current) {
          onInputBlur()
        }
      },
    }));

    const onInputFocus = () => {
      textInputRef?.current?.focus();
      onFocus();
      setIsFocused(true);
    };
    const onInputBlur = () => {
      textInputRef?.current?.blur();
      onBlur();
      setIsFocused(false)
    };

    return (
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#888"
          returnKeyType="search"
          autoFocus={autoFocus}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        {isFocused && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <ClearIcon size={16} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
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
