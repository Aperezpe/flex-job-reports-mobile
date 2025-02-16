import React from "react";
import { Stack } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";

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
