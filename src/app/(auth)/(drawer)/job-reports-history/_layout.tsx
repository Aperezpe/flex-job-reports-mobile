import React from "react";
import { Stack } from "expo-router";
import { AppColors } from "../../../../constants/AppColors";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";

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
          title: "Job Reports",
          headerLeft: () => <DrawerMenu />,
        }}
      />
      <Stack.Screen
        name="[jobReportId]"
        options={{
          title: "Job Reports",
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default JobReportsHistoryStackLayout;
