import { FontAwesome } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { makeStyles } from "@rneui/themed";
import BackButton from "../../../../../../components/BackButton";
import { AppColors } from "../../../../../../constants/AppColors";
import TabButton from "../../../../../../components/client-details/TabButton";
import { ClientTabProvider } from "../../../../../../context/ClientTabContext";

export default function TabLayout() {
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <ClientTabProvider>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          animation: "fade",
          sceneStyle: styles.content,
          headerLeft: () => (
            <BackButton
              onPress={() => router.dismissTo("clients")}
              color={AppColors.bluePrimary}
              size={32}
            />
          ),
          headerLeftContainerStyle: {
            paddingLeft: 8,
          },
          headerShown: true,
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
          name="middle-button"
          options={{
            tabBarButton: (props) => <TabButton {...props} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              console.log("clicked");
            },
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
    </ClientTabProvider>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));
