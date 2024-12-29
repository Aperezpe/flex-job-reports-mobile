import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import ClearIcon from "./CustomIcons/ClearIcon";
import { AppColors } from "../constants/AppColors";
import { SearchBar, SearchBarIosProps } from "@rneui/base";

type Props = {} & SearchBarIosProps;

const AppSearchBar = ({
  placeholder,
  onChangeText,
  value,
  containerStyle,
}: Props) => {
  return (
    <View style={containerStyle}>
      <SearchBar
        platform="ios"
        searchIcon={<Ionicons name="search-sharp" style={styles.leftIcon} />}
        placeholder={placeholder}
        clearIcon={
          <TouchableOpacity onPress={() => onChangeText?.('')}>
            <ClearIcon size={16} />
          </TouchableOpacity>
        }
        inputContainerStyle={styles.inputContainer}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default AppSearchBar;

const styles = StyleSheet.create({
  inputContainer: {
    height: 30,
    transitionProperty: "all",
    transitionDuration: "1s",
  },
  leftIcon: { fontSize: 17.5, color: AppColors.primaryDarkGray },
});
