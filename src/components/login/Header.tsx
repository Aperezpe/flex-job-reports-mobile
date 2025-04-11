import { Image } from "expo-image";
import { View } from "react-native";
import React from "react";
import { Text } from "@rneui/themed";
import { makeStyles } from "@rneui/themed";
import { APP_TITLE, BLUR_HASH } from "../../constants";

const Header = () => {
  const styles = useStyles();

  return (
    <View style={styles.header}>
      <Image
        source={
          "https://www.logoai.com/oss/icons/2021/10/27/rA73APprj8wskQ0.png"
        }
        style={styles.appIcon}
        placeholder={{ blurhash: BLUR_HASH }}
        contentFit="contain"
        transition={1000}
      />

      <Text h2 h2Style={styles.appTitle}>
        {APP_TITLE}
      </Text>
    </View>
  );
};

export default Header;

const useStyles = makeStyles((theme) => {
  return {
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
      color: theme.colors.black,
    },
  };
});
