import { Pressable, PressableProps, StyleSheet } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";

type Props = {
  remove?: boolean;
  size?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
} & PressableProps;

const AddRemoveButton = ({
  onPress,
  remove,
  size = 14,
  color,
  backgroundColor,
  padding = 2,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { backgroundColor }]}
    >
      {remove ? (
        <Entypo style={{ padding }} name="minus" size={size} color={color} />
      ) : (
        <Entypo style={{ padding }} name="plus" size={size} color={color} />
      )}
    </Pressable>
  );
};

export default AddRemoveButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
  },
});
