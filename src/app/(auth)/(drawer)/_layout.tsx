import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerMenu from "../../../components/navigation/DrawerMenu";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";
import { fetchCompanyAndUser } from "../../../redux/actions/sessionDataActions";
import LoadingComponent from "../../../components/LoadingComponent";
import { makeStyles } from "@rneui/themed";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { APP_TITLE } from "../../../constants";
import { fetchUserJoinRequest } from "../../../redux/actions/joinRequestActions";

const DrawerLayout = () => {
  const dispatch = useDispatch();
  const styles = useStyles() as {
    drawer: StyleProp<ViewStyle> & { activeBackgroundColor: string };
    drawerLabel: StyleProp<TextStyle>;
    scene: StyleProp<ViewStyle>;
  };
  const { authUser } = useSupabaseAuth();
  const { isAdmin, isTechnicianOrAdmin, appUser } = useSelector(
    selectAppCompanyAndUser
  );
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchCompanyAndUser(authUser.id));
    }
  }, [authUser, dispatch]);

  useEffect(() => {
    if (authUser && appUser?.id) {
      dispatch(fetchUserJoinRequest(authUser.id));
      setIsInitializing(false);
    }
  }, [authUser, appUser, dispatch]);

  if (isInitializing) return <LoadingComponent />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName={!isTechnicianOrAdmin ? "user-lobby" : "settings"}
        screenOptions={{
          headerShown: false,
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
            headerShown: false,
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
            headerShown: false,
            drawerItemStyle: !isTechnicianOrAdmin ? { display: "none" } : {},
          }}
        />
        
        <Drawer.Screen
          name="job-reports-history"
          options={{
            drawerLabel: "Reports History", // Label shown in drawer menu
            title: "", // Header title when screen is open
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
            title: "", // Header title when screen is open
            headerLeft: () => <DrawerMenu />,
            drawerItemStyle: !isAdmin ? { display: "none" } : {},
          }}
        />
        <Drawer.Screen
          name="technicians"
          options={{
            drawerLabel: "Technicians", // Label shown in drawer menu
            title: "Manage Technicians", // Header title when screen is open
            headerLeft: () => <DrawerMenu />,
            headerShown: false,
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
            headerShown: false,
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
