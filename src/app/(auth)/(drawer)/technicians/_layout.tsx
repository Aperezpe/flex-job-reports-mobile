import React from "react";
import { Stack } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../../constants/AppColors";
import NotificationsButton from "../../../../components/technicians/NotificationsButton";
import { useSelector } from "react-redux";
import { selectPendingTechnicians } from "../../../../redux/selectors/techniciansSelector";

const TechniciansStackLayout = () => {
  const pendingTechnicians = useSelector(selectPendingTechnicians)
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
          title: "Manage Technicians",
          headerLeft: () => <DrawerMenu />,
          headerRight: () => <NotificationsButton notifications={pendingTechnicians.length} />,
        }}
      />
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
