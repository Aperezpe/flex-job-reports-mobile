import React, {
  ReactElement,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  type TextInputProps,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import { AppColors } from "../../constants/AppColors";
import { globalStyles } from "../../constants/GlobalStyles";
import { Picker, PickerIOS } from "@react-native-picker/picker";
import { BottomSheet } from "@rneui/base";
import { Modal as RNModal, ModalProps as RNModalProps } from "react-native";
import ButtonText from "../ButtonText";
import Modal from "../Modal";

export type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  inputContainerStyle?: StyleProp<ViewStyle>;
  inlineErrorMessage?: string;
  options: DropdownOption[];
} & TextInputProps;

export const CustomDropdown = (props: CustomDropdownProps) => {
  const { inlineErrorMessage, inputContainerStyle, options } = props;

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
    togglePicker();
  };

  const togglePicker = () => setIsOpen(!isOpen);

  return (
    <>
      <View style={inputContainerStyle}>
        <InputContainer
          isFocused={isOpen}
          onPress={togglePicker}
          showInlineError={showInlineError}
          style={{ backgroundColor: AppColors.whitePrimary }}
        >
          <View style={styles.dropdownContent}>
            {!selectedOption ? (
              <Text
                style={[globalStyles.textRegular, styles.dropdownPlaceholder]}
              >
                Select System Type
              </Text>
            ) : (
              <Text style={[globalStyles.textRegular]}>{selectedOption}</Text>
            )}
          </View>
          <AntDesign name="down" size={16}/>
        </InputContainer>
        <Modal
          visible={isOpen}
          onRequestClose={togglePicker}
          // overlayStyles={styles.modalContainer}
          position="bottom"
          key={"picker-modal"}
          modalViewStyles={ styles.modalContainer}
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
              onValueChange={(itemValue, itemIndex) =>
                setSelectedOption(itemValue.toString())
              }
              itemStyle={{ backgroundColor : AppColors.lightGrayPrimary}}
              // selectionColor={'rgb(255,0,255)'}
            >
              {options.map((option, i) => (
                <PickerIOS.Item key={i} label={option.label} value={option.value} />
              ))}
            </PickerIOS>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    paddingLeft: 8,
  },
  inlineErrorText: {
    color: AppColors.inlineErrorColor,
    fontFamily: "HindVadodara-Medium",
    fontSize: 12,
  },
  pickerHeader: {
    padding: 8,
    backgroundColor: AppColors.whitePrimary,
    borderTopColor: AppColors.primaryDarkGray,
    borderTopWidth: 1
  },

  modalContainer: {
    flexDirection: "row",
    borderRadius: 0,
    padding: 0,
  },
  pickerContainer: {
    backgroundColor: "white",
  },
  dropdownContent: {
    flex: 1,
    paddingLeft: 8,
  },
  dropdownPlaceholder: {
    color: AppColors.grayPlaceholder,
  },
});
