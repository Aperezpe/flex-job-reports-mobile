import { FontAwesome } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { makeStyles } from "@rneui/themed";
import BackButton from "../../../../../../components/BackButton";
import { AppColors } from "../../../../../../constants/AppColors";


export default function TabLayout() {
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        animation: "none",
        sceneStyle: styles.content,
        headerLeft: () => (
          <BackButton
            onPress={() => router.dismissTo("clients")}
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
        name="index"
        initialParams={{ id }}
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
          tabBarLabel: "Client",
        }}
        
      />
      <Tabs.Screen
        name="reports-history"
        initialParams={{ id }}
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
          tabBarLabel: "Reports History",
        }}
      />
    </Tabs>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));
