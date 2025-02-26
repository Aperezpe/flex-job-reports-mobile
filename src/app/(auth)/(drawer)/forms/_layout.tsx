import React from "react";
import { Stack } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../../constants/AppColors";

const ClientsStackLayout = () => {
  const styles = useStyles();
  return (
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: styles.content,
          headerTitleStyle: styles.title,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Forms",
            headerLeft: () => <DrawerMenu />,
          }}
          />
        <Stack.Screen
          name="[systemId]"
          options={{
            title: "",
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: AppColors.grayBackdrop }
          }}
        />
      </Stack>
  );
};

export default ClientsStackLayout;

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.black,
  },
}));
