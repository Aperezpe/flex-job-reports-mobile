import { TouchableOpacity, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../constants/AppColors";
import { TouchableOpacityProps } from "react-native-gesture-handler";
import { makeStyles } from "@rneui/themed";

type Props = {
  type?: "circle" | "rectangle";
  borderRadius?: number;
} & TouchableOpacityProps;

const OptionsButton = ({ onPress, type, style, borderRadius = 6 }: Props) => {
  const styles = useStyles();
  
  const getButton = (): JSX.Element => {
    switch (type) {
      case "circle":
        return (
          <TouchableOpacity onPress={onPress}>
            <MaterialCommunityIcons
              name="dots-horizontal-circle-outline"
              color={AppColors.bluePrimary}
              size={24}
            />
          </TouchableOpacity>
        );
      case "rectangle":
        return (
          <TouchableOpacity onPress={onPress}>
            <View style={[styles.rectangleIcon, { borderRadius }]}>
              <MaterialCommunityIcons
                name="dots-horizontal"
                color={AppColors.bluePrimary}
                size={20}
              />
            </View>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity onPress={onPress}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              color={AppColors.bluePrimary}
              size={24}
            />
          </TouchableOpacity>
        );
    }
  }
  return <View style={style}>{getButton()}</View>

};

export default OptionsButton;

const useStyles = makeStyles((theme) => ({
  rectangleIcon: {
    borderRadius: 6,
    paddingHorizontal: 3,
    backgroundColor: theme.colors.blueOpacity
  }
}));
