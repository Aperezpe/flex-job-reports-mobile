import React from "react";
import { Stack } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";

const ClientsStackLayout = () => {
  const styles = useStyles();
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: true,
        contentStyle: styles.content,
        headerStyle: styles.header,
        headerTitleStyle: styles.title,
        headerSearchBarOptions: {
          placeholder: "search",
          hideWhenScrolling: true,
          placement: "stacked",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Clients",
          headerLeft: () => <DrawerMenu />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerBackVisible: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="report/[id]"
        options={{
          title: "Report",
          headerSearchBarOptions: undefined,
          presentation: "fullScreenModal"
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
  header: {
    backgroundColor: theme.colors.white,
  },
  title: {
    color: theme.colors.black,
  },
}));
