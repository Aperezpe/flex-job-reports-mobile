import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import ButtonText from "../ButtonText";
import Modal from "../Modal";
import { makeStyles } from "@rneui/themed";
import { useFormContext } from "react-hook-form";
import { globalStyles } from "../../constants/GlobalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";

type CustomDatePickerProps = {
  fieldName: string;
  initialValue: Date | null;
  placeholder: string;
  inlineErrorMessage?: string;
  onChange: (value: Date) => void;
};

export const CustomDatePicker = ({
  fieldName,
  initialValue,
  placeholder,
  onChange,
  inlineErrorMessage,
}: CustomDatePickerProps) => {
  const styles = useStyles();
  const { watch, setValue } = useFormContext();
  const fieldValue = watch(fieldName);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(fieldValue);
  const [prevDate, setPrevDate] = useState<Date | null>(fieldValue);
  const [displayDate, setDisplayDate] = useState<string>("");

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // Example: June 22, 2024
  };

  useEffect(() => {
    setDisplayDate(formatDate(initialValue));
  }, []);

  const handleDone = () => {
    if (prevDate?.getTime() !== selectedDate?.getTime()) {
      onChange?.(selectedDate as Date);
      setValue(fieldName, selectedDate);
      setPrevDate(selectedDate);
      setDisplayDate(formatDate(selectedDate));
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
                displayDate ? null : styles.placeholder,
              ]}
            >
              {displayDate || placeholder}
            </Text>
          </View>
          <AntDesign name="calendar" size={24} color={styles.textInput.color} />
        </InputContainer>
        {showInlineError && (
          <Text style={globalStyles.inlineErrorText}>{inlineErrorMessage}</Text>
        )}
      </View>

      {isPickerOpen && (
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
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="inline"
                onChange={(_, date) => {
                  if (date) setSelectedDate(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
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
  pickerContainer: {
    alignItems: "center",
  },
}));
