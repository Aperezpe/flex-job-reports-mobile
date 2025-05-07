import React from "react";
import CustomButton from "./CustomButton";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../constants/AppColors";

type Props = {
  onPress: () => void;
};

const CloseButton = ({ onPress }: Props) => {
  return (
    <CustomButton
      primary
      buttonTextStyle={{ paddingVertical: 2 }}
      onPress={onPress}
    >
      <Ionicons name="close" size={20} color={AppColors.darkBluePrimary} />
    </CustomButton>
  );
};

export default CloseButton;