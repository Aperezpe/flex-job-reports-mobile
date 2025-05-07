import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/AppColors";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {
  notifications?: number;
};

const NotificationsButton = ({ notifications = 0 }: Props) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push("technicians/pending-technicians")}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="bell" size={24} color={AppColors.bluePrimary} />
        {notifications > 0 && (
          <View style={styles.notificationDot}>
            <Text style={[globalStyles.textBold, styles.notificationText]}>{notifications > 99 ? 99 : notifications}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default NotificationsButton;

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.red2,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: AppColors.whitePrimary,
    fontSize: 11,
  },
});
