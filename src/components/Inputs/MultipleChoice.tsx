import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Divider } from "@rneui/base";
import { Controller, useFormContext } from "react-hook-form";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";
import ItemTile from "../clients/ItemTile";
import { ListContent } from "../../types/FieldEdit";

type MultipleChoiceProps = {
  fieldName?: string;
  options: ListContent[];
  option?: ListContent;
  onChange?: (value: ListContent) => void;
  inlineErrorMessage?: string;
  addOther?: boolean;
};

export const OTHER_OPTION_KEY = 123;

const MultipleChoice = ({
  fieldName,
  options,
  onChange,
  inlineErrorMessage,
  addOther = false,
  option,
}: MultipleChoiceProps) => {
  const [selectedOption, setSelectedOption] = useState<number>();

  const [otherOptionText, setOtherOptionText] = useState<string>();
  const { control } = useFormContext();

  useEffect(() => {
    setSelectedOption(option?.key ?? -1);
    setOtherOptionText(option?.key === OTHER_OPTION_KEY ? option?.value : "");
  }, [option]);

  const handleSelection = (key: number) => {
    setSelectedOption(key);
    const value =
      (key === OTHER_OPTION_KEY
        ? otherOptionText // Use the text input value if "Other" is selected
        : options.find((optionKey) => optionKey.key === key)?.value) ?? "";
    onChange?.({
      key,
      value,
    });
  };

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  const handleOnChangeText = (value: string) => {
    const key = OTHER_OPTION_KEY;
    setSelectedOption(key); // Set selected option to "Other"
    setOtherOptionText(value); // Update the text input value
    onChange?.({
      key,
      value,
    }); // Update controller form value
  };

  return (
    <View style={styles.container}>
      {options.map((item, index) => (
        <View key={`${item?.value}-${index}`}>
          <ItemTile
            title={item?.value || ""}
            onPress={() => handleSelection(item?.key ?? -1)}
            titleStyle={[
              selectedOption === item?.key
                ? globalStyles.textBold
                : globalStyles.textRegular,
              {
                color:
                  selectedOption === item?.key
                    ? AppColors.bluePrimary
                    : "black",
              },
            ]}
            RightIcon={() =>
              selectedOption === item?.key && (
                <FontAwesome
                  name="check-circle"
                  size={20}
                  color={AppColors.bluePrimary}
                />
              )
            }
            clickable={onChange !== undefined}
          />
          <Divider />
        </View>
      ))}

      {addOther && (
        <>
          <Controller
            control={control}
            name={`${fieldName}`}
            render={() => (
              <ItemTile
                title="Other"
                titleStyle={[
                  selectedOption === OTHER_OPTION_KEY
                    ? globalStyles.textBold
                    : globalStyles.textRegular,
                  {
                    color:
                      selectedOption === OTHER_OPTION_KEY
                        ? AppColors.bluePrimary
                        : "black",
                  },
                ]}
                value={otherOptionText}
                onChangeText={handleOnChangeText}
                onFocus={() => handleOnChangeText(otherOptionText || "")}
                editable={onChange !== undefined}
                RightIcon={() =>
                  selectedOption === OTHER_OPTION_KEY && (
                    <FontAwesome
                      name="check-circle"
                      size={20}
                      color={AppColors.bluePrimary}
                    />
                  )
                }
                onPress={() => handleSelection(OTHER_OPTION_KEY)}
                clickable={true}
              />
            )}
          />
          <Divider />
        </>
      )}

      {showInlineError && (
        <Text style={[globalStyles.textRegular, globalStyles.inlineErrorText]}>
          {inlineErrorMessage}
        </Text>
      )}
    </View>
  );
};

export default MultipleChoice;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 24,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
