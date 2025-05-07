import React from "react";
import { Feather } from "@expo/vector-icons";

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
};

const BackButton = ({ onPress, size, color }: Props) => {
  return (
    <Feather name="chevron-left" size={size} onPress={onPress} color={color} />
  );
};

export default BackButton;
