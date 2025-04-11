import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useAssets } from "expo-asset";
import { globalStyles } from "../../../constants/GlobalStyles";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { AppColors } from "../../../constants/AppColors";
import pendingTechnicianImage from "../../../assets/images/pending_technician.png";

const PendingTechnician = () => {
  const [assets, error] = useAssets([pendingTechnicianImage]);

  const { appCompany } = useSelector(selectAppCompanyAndUser);

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textTitle, styles.textTitle]}>
        Your request has been sent!
      </Text>

      {error && (
        <Text style={{ color: "red", marginVertical: 10 }}>
          Failed to load image.
        </Text>
      )}

      {assets && (
        <Image
          source={assets[0]}
          style={styles.image}
          placeholder={{ blurhash: "LAAAAAAAAAAA" }}
          alt="pending technician"
          contentFit="contain"
          transition={500}
        />
      )}
      <Text style={[globalStyles.textRegular, styles.textRegular]}>
        Waiting for "{appCompany?.companyName}" to accept your request.
      </Text>
    </View>
  );
};

export default PendingTechnician;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 35,
  },
  textTitle: {
    fontSize: 20,
    textAlign: "center",
  },
  image: {
    flexGrow: 1,
    width: 225,
    height: 225,
  },
  textRegular: {
    textAlign: "center",
    color: AppColors.darkGray,
  },
});
