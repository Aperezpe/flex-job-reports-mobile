import { Text } from "@rneui/base";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const Header = () => {
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <View style={styles.header}>
      <Image
        source={
          "https://www.logoai.com/oss/icons/2021/10/27/rA73APprj8wskQ0.png"
        }
        style={styles.appIcon}
        placeholder={{ blurhash }}
        contentFit="contain"
        transition={1000}
      />

      <Text h2 h2Style={styles.appTitle}>
        FlexJobReports
      </Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    justifyContent: "center",
    paddingVertical: 50,
    gap: 15,
  },
  appIcon: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  appTitle: {
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  }
}) 