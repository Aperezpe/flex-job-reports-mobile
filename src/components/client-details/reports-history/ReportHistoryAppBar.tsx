import { Pressable, StyleSheet, View } from "react-native";
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
import AppBarHeader from "./AppBarHeader";

const DATE_PLACEHOLDER = "Date";

interface ReportHistoryAppBarProps {
  onDateSubmitted?: (date: Date | null) => void;
  onSearch?: (text: string) => void;
  onCancelSearch?: () => void;
}

export const ReportHistoryAppBar = ({
  onDateSubmitted,
  onSearch,
  onCancelSearch,
}: ReportHistoryAppBarProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [displayDate, setDisplayDate] = useState<string>(DATE_PLACEHOLDER);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const togglePicker = () => setIsPickerOpen(!isPickerOpen);

  const handleDone = () => {
    const date = selectedDate ?? new Date();
    setDisplayDate(formatDate(date)); // Format and display the selected date
    setIsFilterActive(true);
    onDateSubmitted?.(date);
    togglePicker();
  };

  const handleClearFilters = () => {
    setSelectedDate(null);
    setDisplayDate(DATE_PLACEHOLDER);
    setIsFilterActive(false);
    if (onDateSubmitted) {
      onDateSubmitted(null); // Reset to current date or any default action
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <AppBarHeader onSearch={onSearch} onCancelSearch={onCancelSearch} />
        <View style={[globalStyles.row]}>
          <View style={styles.bottomRow}>
            <Pressable
              style={[globalStyles.row, styles.dateButton]}
              onPress={togglePicker}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  {
                    color:
                      displayDate !== DATE_PLACEHOLDER
                        ? AppColors.bluePrimary
                        : AppColors.darkBluePrimary,
                  },
                ]}
              >
                {displayDate}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} />
            </Pressable>
          </View>

          {isFilterActive && (
            <ButtonText onPress={handleClearFilters}>Clear</ButtonText>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.whitePrimary,
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
    flex: 1,
    textAlign: "center",
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

  searchIcon: { marginLeft: -5 },
});
