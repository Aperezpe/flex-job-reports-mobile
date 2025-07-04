import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Divider } from "@rneui/base";
import { Controller, useFormContext } from "react-hook-form";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";
import ItemTile from "../clients/ItemTile";
import { ListContent } from "../../types/FieldEdit";

export const OTHER_OPTION_KEY = 123;

type CheckboxesProps = {
  fieldName?: string;
  value?: ListContent[];
  options: ListContent[];
  onChange?: (value: ListContent[]) => void;
  inlineErrorMessage?: string;
  addOther?: boolean;
  keyValues?: number[];
  viewOnlyValues?: ListContent[];
};

const Checkboxes = ({
  fieldName,
  value = [],
  options,
  keyValues = value
    ? value
        .flatMap((option) => option.key)
        .filter((key): key is number => key !== undefined) ?? []
    : [],
  onChange,
  inlineErrorMessage,
  viewOnlyValues = [],
  addOther = false,
}: CheckboxesProps) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    keyValues ?? []
  );
  const [otherOptionText, setOtherOptionText] = useState<string>(
    value.find((option) => option.key === OTHER_OPTION_KEY)
      ?.value ?? ""
  );

  const [optionsWithOther, setOptionsWithOther] =
    useState<ListContent[]>(options);
  const viewOnly = !onChange;

  const { control } = useFormContext();

  useEffect(() => {
    if (viewOnly) {
      const viewOnlyContainsOther = viewOnlyValues.some(
        (item) => item.key === OTHER_OPTION_KEY
      );

      if (viewOnlyContainsOther) {
        const viewOnlyOtherValue = viewOnlyValues.find(
          (item) => item.key === OTHER_OPTION_KEY
        )!;
        setOptionsWithOther([...optionsWithOther, viewOnlyOtherValue]);
        setSelectedOptions([...keyValues, OTHER_OPTION_KEY]);
      }
    }
  }, [viewOnlyValues]);

  const toggleSelection = (keyValue: number) => {
    let updated;
    if (selectedOptions.includes(keyValue)) {
      updated = selectedOptions.filter((k) => k !== keyValue);
    } else {
      updated = [...selectedOptions, keyValue];
    }
    setSelectedOptions(updated);
    notifyChange(updated, otherOptionText);
  };

  const notifyChange = (selectedKeys: number[], otherText: string) => {
    const values: ListContent[] = [];

    selectedKeys.forEach((key) => {
      if (key === OTHER_OPTION_KEY) {
        values.push({ key, value: otherText.trim() });
      } else {
        const match = options.find((opt) => opt.key === key);
        if (match && match.key !== undefined)
          values.push({ key: match.key, value: match.value });
      }
    });

    onChange?.(values);
  };

  const handleOtherTextChange = (text: string) => {
    if (!selectedOptions.includes(OTHER_OPTION_KEY)) {
      setSelectedOptions((prev) => [...prev, OTHER_OPTION_KEY]);
    }
    setOtherOptionText(text);
    notifyChange(
      [
        ...selectedOptions.filter(
          (optionKey) => optionKey !== OTHER_OPTION_KEY
        ),
        OTHER_OPTION_KEY,
      ],
      text
    );
  };

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  return (
    <>
      <FlatList
        data={viewOnly ? optionsWithOther : options}
        keyExtractor={(item, index) => `${item?.key}-${index}`}
        renderItem={({ item }) => (
          <ItemTile
            title={item?.value || ""}
            titleStyle={[
              selectedOptions.includes(item?.key ?? -1)
                ? globalStyles.textBold
                : globalStyles.textRegular,
              {
                color: selectedOptions.includes(item?.key ?? -1)
                  ? AppColors.bluePrimary
                  : "black",
              },
            ]}
            RightIcon={() =>
              selectedOptions.includes(item?.key ?? -1) && (
                <FontAwesome
                  name="check-square"
                  size={20}
                  color={AppColors.bluePrimary}
                />
              )
            }
            onPress={() => toggleSelection(item?.key ?? -1)}
            clickable={onChange !== undefined}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
      />
      {addOther && (
        <>
          <Divider />
          <Controller
            control={control}
            name={`${fieldName}`}
            render={() => (
              <ItemTile
                title="Other"
                titleStyle={[
                  selectedOptions.includes(OTHER_OPTION_KEY)
                    ? globalStyles.textBold
                    : globalStyles.textRegular,
                  {
                    color: selectedOptions.includes(OTHER_OPTION_KEY)
                      ? AppColors.bluePrimary
                      : "black",
                  },
                ]}
                value={
                  (Array.isArray(value)
                    ? value.find(
                        (option) => option.key === OTHER_OPTION_KEY
                      )
                    : undefined
                  )?.value ?? otherOptionText
                }
                onChangeText={handleOtherTextChange}
                onFocus={() => {
                  handleOtherTextChange(otherOptionText || "");
                }}
                editable={!viewOnly}
                RightIcon={() =>
                  selectedOptions.includes(OTHER_OPTION_KEY) && (
                    <FontAwesome
                      name="check-square"
                      size={20}
                      color={AppColors.bluePrimary}
                    />
                  )
                }
                onPress={() => toggleSelection(OTHER_OPTION_KEY)}
                clickable={!viewOnly}
              />
            )}
          />
        </>
      )}
      {showInlineError && (
        <Text style={[globalStyles.textRegular, globalStyles.inlineErrorText]}>
          {inlineErrorMessage}
        </Text>
      )}
    </>
  );
};

export default Checkboxes;
