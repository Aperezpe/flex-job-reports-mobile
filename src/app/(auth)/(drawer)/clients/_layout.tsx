import React from "react";
import { Stack, useRouter } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import CloseButton from "../../../../components/CloseButton";

const ClientsStackLayout = () => {
  const styles = useStyles();
  const router = useRouter();

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
        name="client/[id]"
        options={{
          title: "Client",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ticket/start-ticket-modal"
        options={{
          title: "Starting ticket for:",
          headerSearchBarOptions: undefined,
          animation: 'slide_from_bottom',
          headerLeft: () => <CloseButton onPress={router.back} />,
        }}
      />
      <Stack.Screen
        name="report/[systemId]"
        getId={({ params }) => params?.systemId?.toString()}
        options={{
          animation: 'simple_push',
          headerSearchBarOptions: undefined,
          headerBackButtonMenuEnabled: true,
          headerBackButtonDisplayMode: 'minimal'
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
