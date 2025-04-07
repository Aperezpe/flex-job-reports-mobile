import { FontAwesome } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import BackButton from "../../../../../components/BackButton";
import { AppColors } from "../../../../../constants/AppColors";

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      initialRouteName="[id]"
      screenOptions={{
        headerLeft: () => (
          <BackButton
            onPress={() => router.back()}
            color={AppColors.bluePrimary}
            size={32}
          />
        ),
        headerShown: true,
        headerSearchBarOptions: {
          placeholder: "Search",
        },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Tabs.Screen
        name="[id]"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports-history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
