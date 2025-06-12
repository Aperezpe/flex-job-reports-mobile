import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";

type MultipleChoiceGridProps = {
  value?: { [row: string]: string }; // Pre-selected values
  rows: string[];
  columns: string[];
  onChange?: (selected: { [row: string]: string }) => void; // Optional callback
  inlineErrorMessage?: string;
};

export const MultipleChoiceGrid = ({
  value,
  rows,
  columns,
  onChange,
  inlineErrorMessage,
}: MultipleChoiceGridProps) => {
  const [selectedOptions, setSelectedOptions] = useState<{ [row: string]: string }>(
    value || {} // Initialize with pre-selected values if provided
  );

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  const handleSelection = (row: string, column: string) => {
    if (value) return; // Disable selection if `value` is provided

    const updatedSelections = { ...selectedOptions, [row]: column };
    setSelectedOptions(updatedSelections);
    onChange?.(updatedSelections);
  };

  return (
    <View style={styles.container}>
      {/* Render column headers */}
      <View style={[globalStyles.row, styles.row]}>
        <Text style={[globalStyles.textBold, styles.headerCell]}></Text>
        {columns.map((column) => (
          <Text key={column} style={[globalStyles.textBold, styles.headerCell]}>
            {column}
          </Text>
        ))}
      </View>

      {/* Render rows with selectable options */}
      {rows.map((row) => (
        <View key={row} style={[globalStyles.row, styles.row]}>
          <Text style={[globalStyles.textRegular, styles.rowTitle]}>{row}</Text>
          {columns.map((column) => (
            <TouchableOpacity
              key={column}
              style={[
                styles.cell,
                selectedOptions[row] === column ? styles.selectedCell : null,
              ]}
              onPress={() => handleSelection(row, column)}
              disabled={!!value} // Disable selection if `value` is provided
            >
              <View
                style={[
                  styles.radioButtonContainer,
                  selectedOptions[row] === column
                    ? styles.selectedRadioButtonBorder
                    : null,
                ]}
              >
                <View
                  style={
                    selectedOptions[row] === column
                      ? styles.selectedRadioButtonCenter
                      : null
                  }
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Inline error message */}
      {showInlineError && (
        <Text style={[globalStyles.textRegular, globalStyles.inlineErrorText]}>
          {inlineErrorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    color: AppColors.darkBluePrimary,
  },
  row: {
    marginBottom: 10,
  },
  rowTitle: {
    flex: 1,
    textAlign: "left",
    color: AppColors.darkBluePrimary,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.grayPlaceholder,
    borderRadius: 4,
  },
  selectedCell: {
    backgroundColor: AppColors.lightGrayPrimary,
  },
  radioButtonContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppColors.grayPlaceholder,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButtonBorder: {
    borderColor: AppColors.bluePrimary,
  },
  selectedRadioButtonCenter: {
    backgroundColor: AppColors.bluePrimary,
    width: 8,
    height: 8,
    borderRadius: 8,
  },
});