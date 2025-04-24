import React from "react";
import { Stack } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";

const SettingsStackLayout = () => {
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
          title: "Settings",
          headerLeft: () => <DrawerMenu />,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: "Account",
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="configuration"
        options={{
          title: "Configuration",
          headerBackVisible: true,
        }}
        
      />
    </Stack>
  );
};

export default SettingsStackLayout;

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.black,
  },
}));
