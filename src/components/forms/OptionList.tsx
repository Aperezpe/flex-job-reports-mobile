import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Text, Divider } from "@rneui/themed";
import { AppColors } from "../../constants/AppColors";
import AddRemoveButton from "../AddRemoveButton";
import ReorderableList from "react-native-reorderable-list";
import { FieldEditValues, ListContent } from "../../types/FieldEdit";
import { Control, Controller, useFieldArray } from "react-hook-form";
import OptionItem from "./DropdownOptionItem";

type OptionListProps = {
  control: Control<FieldEditValues, any>;
  name: "listContent" | "gridContent.rows" | "gridContent.columns";
  options: ListContent[];
  onAddOption: (option: string) => void;
  onRemoveOption: (index: number) => void;
  placeholder?: string;
  errorMessage?: string;
  optionCount?: boolean;
};

const OptionList = ({
  control,
  name,
  options,
  onAddOption,
  onRemoveOption,
  placeholder = "Add Option",
  errorMessage,
  optionCount = false,
}: OptionListProps) => {
  const [addOptionText, setAddOptionText] = useState("");

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name,
  });

  const handleAddOption = () => {
    if (addOptionText.trim() === "") {
      Alert.alert("Error", "Please enter a valid option");
      return;
    }
    append({ value: addOptionText });
    onAddOption(addOptionText);
    setAddOptionText("");
  };

  const handleRemoveOption = (index: number) => {
    if (index < 0 || index >= options.length) {
      Alert.alert("Error", "Invalid option index");
      return;
    }
    remove(index);
    onRemoveOption(index);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= options.length ||
      toIndex < 0 ||
      toIndex >= options.length
    ) {
      Alert.alert("Error", "Invalid reorder indices");
      return;
    }

    swap(fromIndex, toIndex);
  };

  return (
    <>
      <View style={[styles.row]}>
        <TextInput
          placeholder={placeholder}
          value={addOptionText}
          onChangeText={setAddOptionText}
          style={styles.textInput}
        />
        <AddRemoveButton
          onPress={handleAddOption}
          backgroundColor={AppColors.bluePrimary}
          color={AppColors.whitePrimary}
          size={18}
        />
      </View>
      {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
      <View style={{ gap: 10 }}>
        <ReorderableList
          data={fields}
          contentInsetAdjustmentBehavior={"never"}
          keyExtractor={(field) => `$${field.id}`}
          onReorder={(e) => handleReorder(e.from, e.to)}
          scrollEnabled={false}
          renderItem={({ index }) => (
            <Controller
              control={control}
              name={`${name}.${index}`}
              render={({ field: { value: option, onChange } }) => (
                <OptionItem
                  option={option}
                  onChangeText={(text) => {
                    onChange({ ...option, value: text });
                  }}
                  trailingText={optionCount ? `${index + 1}. ` : ""}
                  onPress={() => handleRemoveOption(index)}
                />
              )}
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
