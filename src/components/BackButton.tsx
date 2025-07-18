import React from "react";
import { Feather } from "@expo/vector-icons";
import { StyleProp, TextStyle } from "react-native";

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>
};

const BackButton = ({ onPress, size, color, style }: Props) => {
  return ( 
    <Feather name="chevron-left" size={size} onPress={onPress} color={color} style={style} />
  );
};

export default BackButton;
