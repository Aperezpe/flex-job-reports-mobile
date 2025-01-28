import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { System } from "../../types/System";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import { AntDesign } from "@expo/vector-icons";

type Props = {
  system: System | null;
};

const SystemGridItem = ({ system }: Props) => {
  const calculateLastService = (lastService?: string) => {
    if (lastService) {
      const today = new Date();
      const lastServiceDate = new Date(lastService);

      const diffTime = today.getTime() - lastServiceDate.getTime();
      const days = Math.floor(Math.abs(diffTime / (1000 * 60 * 60 * 24)));

      const years = Math.floor(days / 365);
      const months = Math.floor(days / 30);
      const weeks = Math.floor(days / 7);

      if (years > 0) {
        const yearString = years > 1 ? "years" : "year";
        return `${years} ${yearString} ago`;
      } else if (months > 0) {
        const monthString = months > 1 ? "months" : "month";
        return `${months} ${monthString} ago`;
      } else if (weeks > 0) {
        const weekString = weeks > 1 ? "weeks" : "week";
        return `${weeks} ${weekString} ago`;
      } else if (days > 0) {
        const dayString = days > 1 ? "days" : "day";
        return `${days} ${dayString} ago`;
      } else if (days === 0) {
        return "Today";
      }
    }
    return "Last Service: N/A";
  };

  return (
    <View style={{flex: 1}}>
      {system && (
        <View style={styles.container}>
          <View style={[globalStyles.row]}>
            <Text style={[globalStyles.textBold, styles.systemTitle]}>
              {system?.systemName}
            </Text>
            <OptionsButton type="rectangle" borderRadius={5} />
          </View>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {system?.systemType}
          </Text>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {system?.area}
          </Text>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {system?.tonnage} lbs
          </Text>
          <View style={[globalStyles.row, styles.lastServicedContainer]}>
            <AntDesign name="clockcircle" color={AppColors.grayPlaceholder} />
            <Text style={[globalStyles.textSemiBold, styles.lastServicedText]}>
              {calculateLastService(system?.lastService)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SystemGridItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    borderColor: AppColors.lightGraySecondary,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  systemTitle: {
    flex: 1,
    fontSize: 15,
  },
  systemText: {
    color: AppColors.darkGray,
    fontSize: 12,
  },
  lastServicedContainer: {
    gap: 5,
  },
  lastServicedText: {
    fontSize: 12,
    color: AppColors.grayPlaceholder,
  },
});
