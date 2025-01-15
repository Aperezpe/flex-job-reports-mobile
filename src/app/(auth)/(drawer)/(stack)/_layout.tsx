import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../../constants/AppColors";
import { ClientProps } from "./clients/[id]";

type Props = {};

const StackLayout = (props: Props) => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: styles.contentStyle,
      }}
    >
      <Stack.Screen
        name="clients/index"
        options={{
          headerLeft: () => <DrawerMenu />,
        }}
      />
      <Stack.Screen
        name="clients/[id]"
        options={{
          title: "",
          headerBackVisible: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
};

export default StackLayout;

const styles = StyleSheet.create({
  contentStyle: {
    flex: 1,
    backgroundColor: AppColors.whitePrimary,
  },
});
