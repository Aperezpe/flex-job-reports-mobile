import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { AppColors } from "../../constants/AppColors";

const DrawerMenu = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <Pressable
      onPress={() => navigation.openDrawer()}
    >
      <Ionicons name="menu" size={24} color={AppColors.bluePrimary} />
    </Pressable>
  );
};

export default DrawerMenu;

const styles = StyleSheet.create({});
