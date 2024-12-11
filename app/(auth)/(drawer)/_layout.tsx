import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

type Props = {};

const DrawerLayout = (props: Props) => {
  return (
    <Stack>
      <Stack.Screen name="index"></Stack.Screen>
      <Stack.Screen name="other"></Stack.Screen>
    </Stack>
  );
};

export default DrawerLayout;

const styles = StyleSheet.create({});
