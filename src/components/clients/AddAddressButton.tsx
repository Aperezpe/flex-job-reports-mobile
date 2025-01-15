import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { globalStyles } from "../../constants/GlobalStyles";
import { AppColors } from "../../constants/AppColors";
import { TouchableOpacityProps } from "react-native-gesture-handler";

type Props = {} & TouchableOpacityProps;

const AddAddressButton = ({ onPress }: Props) => {
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.row, styles.buttonContainer]}
    >
      <Entypo name="plus" size={18} color={AppColors.bluePrimary} />
      <Text
        style={[globalStyles.textSemiBold, { color: AppColors.bluePrimary }]}
      >
        Add Address
      </Text>
    </TouchableOpacity>
  );
};

export default AddAddressButton;

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.lightBlue2,
    borderRadius: 5,
    gap: 3,
  },
});
