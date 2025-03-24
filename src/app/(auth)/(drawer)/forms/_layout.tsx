import React, { useEffect } from "react";
import { Stack, usePathname } from "expo-router";
import { makeStyles } from "@rneui/themed";
import DrawerMenu from "../../../../components/navigation/DrawerMenu";
import { AppColors } from "../../../../constants/AppColors";
import { useDispatch } from "react-redux";
import { clearFormState } from "../../../../redux/actions/systemFormActions";

const ClientsStackLayout = () => {
  const styles = useStyles();
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    if (pathname === "/forms") {
      dispatch(clearFormState());
    }
  }, [pathname]);

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
          contentStyle: { backgroundColor: AppColors.grayBackdrop },
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
