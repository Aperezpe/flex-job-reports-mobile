import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../../../constants/GlobalStyles";
import Header from "../../../../components/login/Header";
import { useAssets } from "expo-asset";

const About = () => {
  return (
    <>
      <Header />
    </>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    alignItems: "center",
  },
});
