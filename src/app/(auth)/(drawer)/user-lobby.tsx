import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useAssets } from "expo-asset";
import { globalStyles } from "../../../constants/GlobalStyles";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { AppColors } from "../../../constants/AppColors";
import pendingTechnicianImage from "../../../assets/images/pending_technician.png";
import noCompanyUserImage from "../../../assets/images/technician_no_company.png";
import CustomButton from "../../../components/CustomButton";

const PendingTechnician = () => {
  const [assets, error] = useAssets([
    pendingTechnicianImage,
    noCompanyUserImage,
  ]);

  const { appCompany, isPendingTechnician, isNoCompanyUser } = useSelector(
    selectAppCompanyAndUser
  );

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textTitle, styles.textTitle]}>
        {isPendingTechnician
          ? "Your request has been sent!"
          : "You have no company!"}
      </Text>

      {error && (
        <Text style={{ color: "red", marginVertical: 10 }}>
          Failed to load image.
        </Text>
      )}

      {assets && (
        <Image
          source={isPendingTechnician ? assets[0] : assets[1]}
          style={styles.image}
          placeholder={{ blurhash: "LAAAAAAAAAAA" }}
          alt="pending technician"
          contentFit="contain"
          transition={500}
        />
      )}
      <Text style={[globalStyles.textRegular, styles.textRegular]}>
        {isPendingTechnician
          ? `Waiting for "${appCompany?.companyName}" to accept your request.`
          : "You can start by joining a company."}
      </Text>
      <CustomButton
        primary={isPendingTechnician}
        buttonContainerStyle={[
          styles.buttonContainerStyle,
          isNoCompanyUser ? styles.blueButton : null,
        ]}
        buttonTextStyle={isNoCompanyUser ? styles.blueButton : null}
      >
        {isPendingTechnician ? "Cancel Request" : "Join a Company"}
      </CustomButton>
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
  buttonContainerStyle: {
    width: "100%",
    padding: 4,
    marginTop: 25,
  },
  blueButton: {
    backgroundColor: AppColors.bluePrimary,
    color: AppColors.whitePrimary,
  },
});
