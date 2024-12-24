import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../../constants/AppColors";

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
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="clients/add-client"
        options={{ presentation: "modal", headerTitle: "New Client" }}
      />
    </Stack>
  );
};

export default StackLayout;

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: AppColors.whitePrimary,
  },
});
