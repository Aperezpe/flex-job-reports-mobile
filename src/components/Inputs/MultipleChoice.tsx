import React, { useState } from "react";
import { Text } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import { FlatList } from "react-native-gesture-handler";
import ItemTile from "../clients/ItemTile";
import { FontAwesome } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";
import { Divider } from "@rneui/base";
import { ListContent } from "../../types/FieldEdit";

type MultipleChoiceProps = {
  checkboxes?: boolean;
  options: ListContent[];
  values?: string[]; // Updated to handle multiple selections
  onChange?: (value: string[] | string) => void; // Updated to handle multiple selections
  inlineErrorMessage?: string;
};

export const MultipleChoice = ({
  checkboxes = false,
  options,
  values,
  onChange,
  inlineErrorMessage,
}: MultipleChoiceProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(values as string[] ?? []); // Updated to track multiple selections

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  const handleSelection = (item: string) => {
    if (checkboxes) {
      // Toggle selection for checkboxes
      const updatedSelections = selectedOptions.includes(item)
        ? selectedOptions.filter((option) => option !== item) // Remove item if already selected
        : [...selectedOptions, item]; // Add item if not selected
      setSelectedOptions(updatedSelections);
      onChange?.(updatedSelections); // Pass updated selections to parent
    } else {
      // Single selection logic
      setSelectedOptions([item]);
      onChange?.(item); // Pass single selection to parent
    }
  };

  return (
    <>
      <FlatList
        data={options}
        keyExtractor={(item, index) => `${item?.value}-${index}`} // Ensure unique key for each item
        renderItem={({ item }) => (
          <ItemTile
            title={item?.value || ""}
            titleStyle={[
              selectedOptions.includes(item?.value)
                ? globalStyles.textBold
                : globalStyles.textRegular,
              {
                color: selectedOptions.includes(item?.value)
                  ? AppColors.bluePrimary
                  : "black",
              },
            ]}
            RightIcon={() =>
              selectedOptions.includes(item?.value) && (
                <FontAwesome
                  name={checkboxes ? "check-square" : "check-circle"} // Use checkbox icon for checkboxes
                  size={20}
                  color={AppColors.bluePrimary}
                />
              )
            }
            onPress={() => handleSelection(item?.value || "")}
            clickable={onChange !== undefined}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
      {showInlineError && (
        <Text style={[globalStyles.textRegular, globalStyles.inlineErrorText]}>
          {inlineErrorMessage}
        </Text>
      )}
    </>
  );
};