import React from "react";
import { Divider } from "@rneui/themed";
import { useSupabaseAuth } from "../../../../context/SupabaseAuthContext";
import { FlatList } from "react-native-gesture-handler";
import ItemTile from "../../../../components/clients/ItemTile";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../../redux/selectors/sessionDataSelectors";

type Setting = {
  title: string;
  onPress: () => void;
  LeftIcon?: React.ComponentType<{ size: number; color: string }>;
  shouldHide?: boolean;
};

const Settings = () => {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();
  const { isAdmin } = useSelector(selectAppCompanyAndUser);

  const handleLogout = async () => {
    // show some alert
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // create list of settings
  const settings: Setting[] = [
    {
      title: "Account",
      onPress: () => router.push("/settings/account"),
    },
    {
      title: "Configuration",
      onPress: () => router.push("/settings/configuration"),
      shouldHide: !isAdmin,
    },
    {
      title: "Help & Support",
      onPress: () => router.push("/settings/help"),
    },
    {
      title: "Privacy Policy",
      onPress: () => router.push("/settings/privacy-policy"),
    },
    {
      title: "Terms of Service",
      onPress: () => router.push("/settings/terms-of-service"),
    },
    {
      title: "About",
      onPress: () => router.push("/settings/about"),
    },
    {
      title: "Logout",
      onPress: handleLogout,
      LeftIcon: () => (
        <MaterialCommunityIcons name="logout" size={24} color="black" />
      ),
    },
  ];
  // create flat list of settings
  return (
    <FlatList
      data={settings}
      keyExtractor={(item) => item.title}
      renderItem={({ item: setting, index }) =>
        setting.shouldHide ? null : (
          <>
            <ItemTile
              containerStyle={{ paddingHorizontal: 12 }}
              title={setting.title}
              onPress={setting.onPress}
              LeftIcon={setting.LeftIcon}
            />
            {index < settings.length - 1 && !settings[index]?.shouldHide && (
              <Divider />
            )}
          </>
        )
      }
      contentContainerStyle={{ padding: 12 }}
    />
  );
};

export default Settings;
