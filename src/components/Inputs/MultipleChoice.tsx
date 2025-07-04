import React, { useState } from "react";
import { FlatList, Text } from "react-native";
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
  const [selectedOption, setSelectedOption] = useState<number>(option?.key ?? -1);

  const [otherOptionText, setOtherOptionText] = useState<string>(option?.key === OTHER_OPTION_KEY ? option?.value : "");
  const { control } = useFormContext();

  const handleSelection = (key: number) => {
    setSelectedOption(key);
    const value =
      key === OTHER_OPTION_KEY
        ? otherOptionText // Use the text input value if "Other" is selected
        : options.find((optionKey) => optionKey.key === key)?.value ?? "";
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
    <>
      <FlatList
        data={options}
        keyExtractor={(item, index) => `${item?.value}-${index}`}
        renderItem={({ item }) => (
          <ItemTile
            title={item?.value || ""}
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
            onPress={() => handleSelection(item?.key ?? -1)}
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

export default MultipleChoice;
