import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import { PickerIOS } from "@react-native-picker/picker";
import ButtonText from "../ButtonText";
import Modal from "../Modal";
import { makeStyles } from "@rneui/themed";
import { useFormContext } from "react-hook-form";
import { globalStyles } from "../../constants/GlobalStyles";
import { ItemValue } from "@react-native-picker/picker/typings/Picker";

export type DropdownOption = {
  label: string;
  value?: string | number;
};

type CustomDropdownProps = {
  fieldName: string;
  options: DropdownOption[];
  initialValue: string | number | null;
  openTextOption?: string;
  inlineErrorMessage?: string;
  placeholder: string;
  onChange: (value: string | number) => void;
};

export const CustomDropdown = ({
  fieldName,
  options,
  initialValue,
  placeholder,
  onChange,
  inlineErrorMessage,
}: CustomDropdownProps) => {
  const styles = useStyles();
  const { watch, setValue } = useFormContext();
  const fieldValue = watch(fieldName);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ItemValue>(fieldValue);
  const [prevOption, setPrevOption] = useState<string | number>(fieldValue);
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  const getOptionLabel = (value?: string | number | null) => {
    return (
      options.find((option) => option.value?.toString() === value?.toString())
        ?.label ?? ""
    );
  };

  useEffect(() => {
    setSelectedLabel(getOptionLabel(initialValue));
  }, []);

  const handleDone = () => {
    if (prevOption !== selectedOption) {
      onChange?.(selectedOption);
      setValue(fieldName, selectedOption);
      setPrevOption(selectedOption);
      setSelectedLabel(getOptionLabel(selectedOption));
    }
    togglePicker();
  };

  const togglePicker = () => setIsPickerOpen(!isPickerOpen);

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  return (
    <View style={{ flexGrow: 1 }}>
      <View>
        <InputContainer
          isFocused={isPickerOpen}
          onPress={togglePicker}
          showInlineError={showInlineError}
        >
          <View style={styles.dropdownContent}>
            <Text
              style={[
                globalStyles.textRegular,
                styles.textInput,
                selectedLabel ? null : styles.placeholder,
              ]}
            >
              {selectedLabel || placeholder}
            </Text>
          </View>
          <AntDesign name="down" size={16} color={styles.textInput.color} />
        </InputContainer>
        {showInlineError && (
          <Text style={globalStyles.inlineErrorText}>{inlineErrorMessage}</Text>
        )}
      </View>

      <Modal
        visible={isPickerOpen}
        onRequestClose={togglePicker}
        position="bottom"
        modalViewStyles={styles.modalContainer}
      >
        <View style={{ flexGrow: 1 }}>
          <View style={[globalStyles.row, styles.pickerHeader]}>
            <ButtonText onPress={togglePicker}>Cancel</ButtonText>
            <ButtonText bold onPress={handleDone}>
              Done
            </ButtonText>
          </View>
          <PickerIOS
            selectedValue={selectedOption}
            onValueChange={setSelectedOption}
          >
            {options.map((option, index) => (
              <PickerIOS.Item
                key={index}
                label={option.label}
                value={option.value}
              />
            ))}
          </PickerIOS>
        </View>
      </Modal>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  textInput: { color: theme.colors.black },
  placeholder: { color: theme.colors.placeholder },
  pickerHeader: {
    padding: 8,
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.highlightOpacity,
    borderTopWidth: 1,
  },
  modalContainer: {
    flexDirection: "row",
    borderRadius: 0,
    padding: 0,
  },
  dropdownContent: { flex: 1, paddingLeft: 8 },
}));
