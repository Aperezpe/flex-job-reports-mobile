import React from "react";
import { Stack } from "expo-router";
import { AppColors } from "../../../../constants/AppColors";

const TechniciansStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: AppColors.whitePrimary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="pending-technicians"
        options={{
          title: "Pending Requests",
          headerSearchBarOptions: undefined,
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
};

export default TechniciansStackLayout;
