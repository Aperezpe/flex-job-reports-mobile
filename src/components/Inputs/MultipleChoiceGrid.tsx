import { Pressable, StyleSheet, Text, View } from "react-native"; // Ensure all imported modules are used
import React, { useState } from "react";
import { GridContent } from "../../types/FieldEdit";
import { CheckBox } from "@rneui/themed";

type GridCellSelection = {
  rowIndex: number;
  colIndex: number;
  rowValue: string;
  colValue: string;
};

type MultipleChoiceGridProps = {
  value?: GridCellSelection[]; // Define the type based on your value structure
  gridOptions?: GridContent; // Define the type based on your grid content structure
  onChange?: (value: GridCellSelection[]) => void; // Define the type based on your onChange handler
  multiple?: boolean;
  inlineErrorMessage?: string; // Optional error message
};

const MultipleChoiceGrid = ({
  value,
  gridOptions,
  onChange,
  multiple = false,
  inlineErrorMessage,
}: MultipleChoiceGridProps) => {
  const rows = gridOptions?.rows ?? [];
  const columns = gridOptions?.columns ?? [];

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<GridCellSelection[]>([]);

  const currentValue = isControlled ? value : internalValue;

  const isSelected = (rowIndex: number, colIndex: number) =>
    currentValue.some(
      (sel) => sel.rowIndex === rowIndex && sel.colIndex === colIndex
    );

  const handleToggle = (rowIndex: number, colIndex: number) => {
    const rowValue = rows[rowIndex]?.value ?? "";
    const colValue = columns[colIndex]?.value ?? "";

    const key = `${rowIndex}-${colIndex}`;
    const existing = currentValue.find(
      (sel) => `${sel.rowIndex}-${sel.colIndex}` === key
    );

    let updated: GridCellSelection[];

    if (multiple) {
      // ⬅️ Toggle checkbox behavior: Add or remove the cell
      if (existing) {
        updated = currentValue.filter(
          (sel) => sel.rowIndex !== rowIndex || sel.colIndex !== colIndex
        );
      } else {
        updated = [...currentValue, { rowIndex, colIndex, rowValue, colValue }];
      }
    } else {
      // ⬅️ Radio-like behavior: Only one per row
      updated = [
        ...currentValue.filter((sel) => sel.rowIndex !== rowIndex),
        { rowIndex, colIndex, rowValue, colValue },
      ];
    }

    // Update internal state
    if (!isControlled) setInternalValue(updated);
    onChange?.(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.cell} />
        {columns.map((col, colIndex) => (
          <View
            style={[styles.cell, styles.headerCell]}
            key={`col-${colIndex}`}
          >
            <Text style={styles.headerText}>{col.value}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View style={styles.row} key={`row-${rowIndex}`}>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>{row.value}</Text>
          </View>

          {columns.map((_, colIndex) => {
            const selected = isSelected(rowIndex, colIndex);

            return (
              <Pressable
                key={`cell-${rowIndex}-${colIndex}`}
                style={styles.cell}
                onPress={() => handleToggle(rowIndex, colIndex)}
              >
                {multiple ? (
                  <CheckBox
                    checked={selected}
                    iconType="material-community"
                    checkedIcon="checkbox-marked"
                    uncheckedIcon="checkbox-blank-outline"
                    onPress={() => handleToggle(rowIndex, colIndex)}
                  />
                ) : (
                  <CheckBox
                    checked={selected}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    onPress={() => handleToggle(rowIndex, colIndex)}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {inlineErrorMessage ? (
        <Text style={styles.errorText}>{inlineErrorMessage}</Text>
      ) : null}
    </View>
  );
};

export default MultipleChoiceGrid;

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  headerCell: {
    backgroundColor: "#f3f3f3",
  },
  headerText: {
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    padding: 6,
    fontSize: 12,
  },
});
