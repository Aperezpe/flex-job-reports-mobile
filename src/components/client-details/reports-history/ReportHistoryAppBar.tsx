import { Pressable, StyleSheet, View } from "react-native";
import DrawerMenu from "../../navigation/DrawerMenu";
import { Text } from "@rneui/themed";
import { AppColors } from "../../../constants/AppColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { globalStyles } from "../../../constants/GlobalStyles";
import { useState } from "react";
import { formatDate } from "../../../utils/date";
import DateTimePicker from "@react-native-community/datetimepicker";
import PickerModal from "../../Inputs/shared/PickerModal";
import ButtonText from "../../ButtonText";
import { SafeAreaView } from "react-native-safe-area-context";

const DATE_PLACEHOLDER = "Date";

interface ReportHistoryAppBarProps {
  onDateSubmitted?: (date: Date | null) => void;
}

export const ReportHistoryAppBar = (props: ReportHistoryAppBarProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [displayDate, setDisplayDate] = useState<string>(DATE_PLACEHOLDER);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const togglePicker = () => setIsPickerOpen(!isPickerOpen);

  const handleDone = () => {
    if (selectedDate) {
      setDisplayDate(formatDate(selectedDate)); // Format and display the selected date
      setIsFilterActive(true);
      if (props.onDateSubmitted) {
        props.onDateSubmitted(selectedDate);
      }
    }
    togglePicker();
  };

  const handleClearFilters = () => {
    setSelectedDate(null);
    setDisplayDate(DATE_PLACEHOLDER);
    setIsFilterActive(false);
    if (props.onDateSubmitted) {
      props.onDateSubmitted(null); // Reset to current date or any default action
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>

      <View style={styles.topRow}>
        <DrawerMenu />
        <Text style={styles.title}>Job Reports</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={[globalStyles.row]}>

      <View style={styles.bottomRow}>
        <Pressable
          style={[globalStyles.row, styles.dateButton]}
          onPress={togglePicker}
        >
          <Text style={[styles.dateButtonText, { color: displayDate !== DATE_PLACEHOLDER ? AppColors.bluePrimary : AppColors.darkBluePrimary }]}>{displayDate}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} />
        </Pressable>
      </View>

      {isFilterActive && <ButtonText onPress={handleClearFilters}>Clear</ButtonText>}
      </View>

      {/* PickerModal for Date Selection */}
      <PickerModal visible={isPickerOpen} onCancel={togglePicker} onDone={handleDone}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.whitePrimary, // Ensure the background matches the header
  },
  header: {
    backgroundColor: AppColors.whitePrimary,
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  dateButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#333",
  },
});