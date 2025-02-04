import React from "react";
import { Stack } from "expo-router";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { makeStyles } from "@rneui/themed";

const StackLayout = () => {
  const styles = useStyles();
  return (
    <Stack
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
        name="clients/index"
        options={{
          title: "Clients",
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

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    backgroundColor: theme.colors.white,
  },
  title: {
    color: theme.colors.black
  }
}));
