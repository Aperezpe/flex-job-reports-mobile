import React, { useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Alert } from "react-native";
import { Text, Divider } from "@rneui/themed";
import { AppColors } from "../../constants/AppColors";
import AddRemoveButton from "../AddRemoveButton";
import OptionItem from "./DropdownOptionItem";

type OptionListProps = {
  options: string[];
  onAddOption: (option: string) => void;
  onRemoveOption: (index: number) => void;
  placeholder?: string;
  errorMessage?: string;
  optionCount?: boolean;
};

const OptionList = ({
  options,
  onAddOption,
  onRemoveOption,
  placeholder = "Add Option",
  errorMessage,
  optionCount = false,
}: OptionListProps) => {
  const [optionText, setOptionText] = useState("");

  const handleAddOption = () => {
    if (optionText.trim() === "") {
      Alert.alert("Error", "Please enter a valid option");
      return; // Prevent adding empty options
    }
    onAddOption(optionText);
    setOptionText(""); // Clear input after adding
  };

  return (
    <>
      <View style={[styles.row]}>
        <TextInput
          placeholder={placeholder}
          value={optionText}
          onChangeText={setOptionText}
          style={styles.textInput}
        />
        <AddRemoveButton
          onPress={handleAddOption}
          backgroundColor={AppColors.bluePrimary}
          color={AppColors.whitePrimary}
          size={18}
        />
      </View>
      {errorMessage && (
        <Text style={{ color: "red" }}>{errorMessage}</Text>
      )}
      <View style={{ gap: 10 }}>
        <FlatList
          data={options}
          scrollEnabled={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: option, index }) => (
            <OptionItem
              trailingText={optionCount ? `${index + 1}. ` : ""}
              option={option}
              onPress={() => onRemoveOption(index)}
            />
          )}
          contentContainerStyle={
            options.length > 0 && styles.dropdownOptionsContainer
          }
          ItemSeparatorComponent={() => (
            <Divider style={{ marginVertical: 8 }} />
          )}
        />
      </View>
    </>
  );
};

export default OptionList;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.grayPlaceholder,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dropdownOptionsContainer: {
    gap: 0,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.grayPlaceholder,
  },
});