import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerMenu from "../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../constants/AppColors";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectLoadingCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";
import { clearCompanyAndUser, fetchCompanyAndUser } from "../../../redux/actions/sessionDataActions";
import LoadingComponent from "../../../components/LoadingComponent";

const DrawerLayout = () => {
  const dispatch = useDispatch();
  const loadingCompanyAndUser = useSelector(selectLoadingCompanyAndUser);
  const { authUser } = useSupabaseAuth();
  
  useEffect(() => {
    if (authUser) {
      dispatch(fetchCompanyAndUser(authUser.id));
    }

    return () => {
      dispatch(clearCompanyAndUser());
    };
  }, [authUser, dispatch]);

  if (loadingCompanyAndUser) return <LoadingComponent />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerLeftContainerStyle: {paddingHorizontal: 15},
          sceneStyle: styles.sceneStyle
        }}
      >
        {/* 
          (stack) route contains the StackLayout with app bar navigation
          - Nested inside the drawer as the main content
          - headerShown: false removes double headers (drawer + stack)
        */}
        <Drawer.Screen
          name="(stack)"
          options={{
            drawerLabel: "Home",
            headerShown: false,
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
            title: "Forms Management", // Header title when screen is open
            headerLeft: () => <DrawerMenu />,
          }}
        />
        <Drawer.Screen
          name="technicians"
          options={{
            drawerLabel: "Technicians", // Label shown in drawer menu
            title: "Manage Technicians", // Header title when screen is open
            headerLeft: () => <DrawerMenu />,
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

const styles = StyleSheet.create({
  sceneStyle: {
    backgroundColor: AppColors.whitePrimary
  }
});

