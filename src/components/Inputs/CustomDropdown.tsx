import React, { useState } from "react";
import { Text, View, type TextInputProps } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";
import { PickerIOS } from "@react-native-picker/picker";
import ButtonText from "../ButtonText";
import Modal from "../Modal";
import { CustomTextInputProps } from "./CustomInput";
import { makeStyles } from "@rneui/themed";

export type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  options: DropdownOption[];
  onDone: ((text: string) => void) | undefined;
} & CustomTextInputProps &
  TextInputProps;

export const CustomDropdown = (props: CustomDropdownProps) => {
  const styles = useStyles();
  const { inlineErrorMessage, inputWrapperStyle, options, onDone } = props;

  const [prevOption, setPrevOption] = useState<string | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const showInlineError =
    inlineErrorMessage !== undefined && inlineErrorMessage !== "";

  const handleCancel = () => {
    setSelectedOption(prevOption);
    togglePicker();
  };
  const handleDone = () => {
    setPrevOption(selectedOption);
    onDone?.(selectedOption ?? '');
    togglePicker();
  };

  const togglePicker = () => setIsOpen(!isOpen);

  return (
    <>
      <View style={inputWrapperStyle}>
        <InputContainer
          isFocused={isOpen}
          onPress={togglePicker}
          showInlineError={showInlineError}
        >
          <View style={styles.dropdownContent}>
            {!selectedOption ? (
              <Text
                style={[globalStyles.textRegular, styles.dropdownPlaceholder]}
              >
                Select System Type
              </Text>
            ) : (
              <Text style={[globalStyles.textRegular, styles.textInput]}>{selectedOption}</Text>
            )}
          </View>
          <AntDesign name="down" size={16} color={styles.textInput.color} />
        </InputContainer>
        <Modal
          visible={isOpen}
          onRequestClose={togglePicker}
          // overlayStyles={styles.modalContainer}
          position="bottom"
          key={"picker-modal"}
          modalViewStyles={styles.modalContainer}
        >
          <View style={{ flexGrow: 1 }}>
            <View style={[globalStyles.row, styles.pickerHeader]}>
              <ButtonText onPress={handleCancel}>Cancel</ButtonText>
              <ButtonText bold onPress={handleDone}>
                Done
              </ButtonText>
            </View>
            <PickerIOS
              selectedValue={selectedOption}
              onValueChange={(itemValue) =>
                setSelectedOption(itemValue.toString())
              }
              itemStyle={styles.pickerContainer}
            >
              {options.map((option, i) => (
                <PickerIOS.Item
                  key={i}
                  label={option.label}
                  value={option.value}
                  color={styles.textInput.color}
                />
              ))}
            </PickerIOS>
          </View>
        </Modal>
      </View>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  textInput: {
    color: theme.colors.black,
  },
  inlineErrorText: {
    color: AppColors.inlineErrorColor,
    fontFamily: "HindVadodara-Medium",
    fontSize: 12,
  },
  pickerHeader: {
    padding: 8,
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.highlightOpacity,
    borderTopWidth: 1,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background,
  },
  modalContainer: {
    flexDirection: "row",
    borderRadius: 0,
    padding: 0,
  },
  dropdownContent: {
    flex: 1,
    paddingLeft: 8,
  },
  dropdownPlaceholder: {
    color: theme.colors.placeholder,
  },
}));
