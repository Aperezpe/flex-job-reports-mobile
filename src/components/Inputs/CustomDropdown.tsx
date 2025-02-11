import React, { useState } from "react";
import { Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import { PickerIOS } from "@react-native-picker/picker";
import ButtonText from "../ButtonText";
import Modal from "../Modal";
import { makeStyles } from "@rneui/themed";
import { useFormContext } from "react-hook-form";
import { globalStyles } from "../../constants/GlobalStyles";

export type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  name: string;
  options: DropdownOption[];
  openTextOption?: string;
  inlineErrorMessage?: string;
  placeholder: string;
  onChange: (...event: any[]) => void;
};

export const CustomDropdown = ({
  name,
  options,
  placeholder,
  onChange,
  inlineErrorMessage,
}: CustomDropdownProps) => {
  const styles = useStyles();
  const { watch } = useFormContext();
  const [option, setOption] = useState("");
  const [prevOption, setPrevOption] = useState("");

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectedOption = watch(name);

  const handleDone = () => {
    if (prevOption !== option) {
      onChange?.(option);
      setPrevOption(option);
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
                styles.textInput,
                selectedOption ? null : styles.placeholder,
              ]}
            >
              {selectedOption || placeholder}
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
            selectedValue={option}
            onValueChange={(itemValue) => setOption(itemValue.toString())}
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
