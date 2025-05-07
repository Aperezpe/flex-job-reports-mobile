import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";

type Props = {
  drag: SharedValue<number>;
} & TouchableOpacityProps;

const RightAction = ({ drag, onPress }: Props) => {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 60 }],
    };
  });

  return (
    <TouchableOpacity
      style={styles.rightAction}
      onPress={onPress}
    >
      <Animated.View style={[styleAnimation]}>
        <MaterialCommunityIcons
          name="eye-off"
          size={22}
          color={AppColors.whitePrimary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default RightAction;

const styles = StyleSheet.create({
  rightAction: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
