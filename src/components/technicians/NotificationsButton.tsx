import { Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/AppColors";
import { FontAwesome5 } from "@expo/vector-icons";

const NotificationsButton = () => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push("technicians/pending-technicians")}>
      <FontAwesome5 name="bell" size={24} color={AppColors.bluePrimary} />
    </Pressable>
  );
};

export default NotificationsButton;
