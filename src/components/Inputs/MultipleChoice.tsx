import React, { useState } from "react";
import { Text } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import { FlatList } from "react-native-gesture-handler";
import ItemTile from "../clients/ItemTile";
import { FontAwesome } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";
import { Divider } from "@rneui/base";

type MultipleChoiceProps = {
  options: string[];
  onChange: (value: string | number) => void;
  inlineErrorMessage?: string;
};

export const MultipleChoice = ({
  options,
  onChange,
  inlineErrorMessage,
}: MultipleChoiceProps) => {
  const [selectedOption, setSelectedOption] = useState<ItemValue | null>(null);

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  return (
    <>
      <FlatList
        data={options}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <ItemTile
            title={item}
            titleStyle={[
              selectedOption === item
                ? globalStyles.textBold
                : globalStyles.textRegular,
              {
                color:
                  selectedOption === item ? AppColors.bluePrimary : "black",
              },
            ]}
            RightIcon={() =>
              selectedOption === item && (
                <FontAwesome
                  name="check-circle"
                  size={20}
                  color={
                    selectedOption === item
                      ? AppColors.bluePrimary
                      : AppColors.darkBluePrimary
                  }
                />
              )
            }
            onPress={() => {
              setSelectedOption(item);
              onChange?.(item);
            }}
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
