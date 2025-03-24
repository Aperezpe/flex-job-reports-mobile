import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import CustomButton from "../../../../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../../../../constants/AppColors";
import ButtonText from "../../../../../components/ButtonText";

type Props = {};

const JobReport = (props: Props) => {
  const navigation = useNavigation();
  const router = useRouter();

  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ButtonText bold>Submit</ButtonText>,
      headerLeft: () => (
        <CustomButton
          primary
          buttonTextStyle={{ paddingVertical: 2 }}
          onPress={handleClose}
        >
          <Ionicons name="close" size={20} color={AppColors.darkBluePrimary} />
        </CustomButton>
      ),
    });
  }, []);

  const handleClose = () => {
    if (changesMade) {
      Alert.alert("Are you sure?", "Your changes will be lost", [
        {
          text: "Cancel",
          style: "cancel",
          isPreferred: true,
        },
        {
          text: "Confirm",
          onPress: router.back,
          style: "destructive",
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View>
      <Text>JobReport </Text>
    </View>
  );
};

export default JobReport;

const styles = StyleSheet.create({});
