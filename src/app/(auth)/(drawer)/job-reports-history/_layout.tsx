import React from "react";
import { Stack } from "expo-router";
import { AppColors } from "../../../../constants/AppColors";

const JobReportsHistoryStackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: AppColors.whitePrimary },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
};

export default JobReportsHistoryStackLayout;
