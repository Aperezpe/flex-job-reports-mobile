import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerMenu from "../../../components/navigation/DrawerMenu";
import { useSelector } from "react-redux";
import {
  selectAppCompanyAndUser,
  selectLoadingSessionData,
} from "../../../redux/selectors/sessionDataSelectors";
import LoadingComponent from "../../../components/LoadingComponent";
import { makeStyles } from "@rneui/themed";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { APP_TITLE } from "../../../constants";

const DrawerLayout = () => {
  const styles = useStyles() as {
    drawer: StyleProp<ViewStyle> & { activeBackgroundColor: string };
    drawerLabel: StyleProp<TextStyle>;
    scene: StyleProp<ViewStyle>;
  };
  const { isAdmin, isTechnicianOrAdmin } = useSelector(selectAppCompanyAndUser);
  const loadingSession = useSelector(selectLoadingSessionData);

  if (loadingSession) return <LoadingComponent />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName={!isTechnicianOrAdmin ? "user-lobby" : "settings"}
        screenOptions={{
          headerShown: false,
          title: "drawerMenu",
          headerLeftContainerStyle: { paddingLeft: 15 },
          headerRightContainerStyle: { paddingRight: 18 },
          drawerStyle: styles.drawer,
          drawerLabelStyle: styles.drawerLabel,
          drawerActiveBackgroundColor: styles.drawer.activeBackgroundColor,
          sceneStyle: styles.scene,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        {/* 
          (stack) route contains the StackLayout with app bar navigation
          - Nested inside the drawer as the main content
          - headerShown: false removes double headers (drawer + stack)
        */}
        <Drawer.Screen
          name="clients"
          options={{
            drawerLabel: "Clients",
            drawerItemStyle: !isTechnicianOrAdmin ? { display: "none" } : {},
          }}
        />

        <Drawer.Screen
          name="job-reports-history"
          options={{
            drawerLabel: "Reports History", // Label shown in drawer menu
            title: "ReportsAppBar", // Header title when screen is open
            headerShown: false,
            headerLeft: () => <DrawerMenu />,
            drawerItemStyle: !isTechnicianOrAdmin ? { display: "none" } : {},
          }}
        />
        {/* 
          Additional drawer routes can be added here
          - Each represents a screen accessible via the drawer menu
          - Will use the drawer header by default
        */}
        <Drawer.Screen
          name="forms"
          options={{
            drawerLabel: "Forms", // Label shown in drawer menu
            headerLeft: () => <DrawerMenu />,
            drawerItemStyle: !isAdmin ? { display: "none" } : {},
          }}
        />
        <Drawer.Screen
          name="technicians"
          options={{
            drawerLabel: "Technicians", // Label shown in drawer menu
            headerLeft: () => <DrawerMenu />,
            drawerItemStyle: isAdmin ? {} : { display: "none" },
          }}
        />
        <Drawer.Screen
          name="user-lobby"
          options={{
            title: APP_TITLE,
            drawerLabel: "Home",
            headerLeft: () => <DrawerMenu />,
            headerShown: true,
            drawerItemStyle: !isTechnicianOrAdmin ? {} : { display: "none" },
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings", // Label shown in drawer menu
            title: "Settings", // Header title when screen is open
            headerLeft: () => <DrawerMenu />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;

const useStyles = makeStyles((theme) => ({
  drawer: {
    backgroundColor: theme.colors.background,
    activeBackgroundColor: theme.colors.highlightOpacity,
  },
  drawerLabel: {
    color: theme.colors.black,
  },
  scene: {
    backgroundColor: theme.colors.background,
  },
}));
