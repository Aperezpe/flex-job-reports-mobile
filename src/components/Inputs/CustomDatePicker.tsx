import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { InputContainer } from "./shared/InputContainer";
import { makeStyles } from "@rneui/themed";
import { FieldValues, UseFormSetValue } from "react-hook-form";
import { globalStyles } from "../../constants/GlobalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../../utils/date";
import PickerModal from "./shared/PickerModal";

type CustomDatePickerProps = {
  fieldName: string;
  value: Date | null;
  setValue: UseFormSetValue<FieldValues>;
  initialValue?: Date | null;
  placeholder: string;
  inlineErrorMessage?: string;
  onChange: (value: Date) => void;
};

export const CustomDatePicker = ({
  fieldName,
  value = new Date(),
  setValue,
  initialValue = new Date(),
  placeholder,
  onChange,
  inlineErrorMessage,
}: CustomDatePickerProps) => {
  const styles = useStyles();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [prevDate, setPrevDate] = useState<Date | null>(value);
  const [displayDate, setDisplayDate] = useState<string>("");

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

      <PickerModal
        visible={isPickerOpen}
        onCancel={togglePicker}
        onDone={handleDone}
      >
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="inline"
          onChange={(_, date) => {
            if (date) setSelectedDate(date);
          }}
        />
      </PickerModal>
    </View>
  );
};

const useStyles = makeStyles((theme) => ({
  textInput: { color: theme.colors.black },
  placeholder: { color: theme.colors.placeholder },
  dropdownContent: { flex: 1, paddingLeft: 8 },
}));