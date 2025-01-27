import { Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { AppColors } from "../../constants/AppColors";

const DrawerMenu = () => {
  const navigation =
    useNavigation<DrawerNavigationProp<{ openDrawer: () => void }>>();

  return (
    <Pressable onPress={() => navigation.openDrawer()}>
      <Ionicons name="menu" size={24} color={AppColors.bluePrimary} />
    </Pressable>
  );
};

export default DrawerMenu;
