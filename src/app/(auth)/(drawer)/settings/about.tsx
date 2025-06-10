import { StyleSheet } from "react-native";
import React from "react";
import Header from "../../../../components/login/Header";

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
