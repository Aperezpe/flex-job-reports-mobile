import { StyleSheet } from "react-native";
import React from "react";
import Header from "../../../../components/login/Header";
import { Text } from "@rneui/themed";
import { ScrollView } from "react-native-gesture-handler";

const About = () => {
  return (
    <ScrollView  contentContainerStyle={styles.container}>
      <Header />
      <Text style={styles.paragraph}>
        Flex Job Reports is a modern job reporting tool built specifically for
        small HVAC businesses. Our goal is to make it easier for technicians to
        document work, track jobs, and keep clients informed — all in one place.
      </Text>

      <Text style={styles.sectionTitle}>Key Features</Text>
      <Text style={styles.paragraph}>
        • Create and submit job reports quickly{"\n"}• Attach photos and system
        information{"\n"}• Track service history by client or address{"\n"}• Fully mobile experience,
        no desktop needed
      </Text>

      <Text style={styles.sectionTitle}>Who It's For</Text>
      <Text style={styles.paragraph}>
        This app was designed with two-person teams or solo HVAC contractors in
        mind. It's lightweight, flexible, and focused on what matters most:
        getting the job done and keeping clean records.
      </Text>

      <Text style={styles.sectionTitle}>Support</Text>
      <Text style={styles.paragraph}>
        Have feedback or need help? Reach out to us at{" "}
        <Text style={styles.link}>aperezpe01@gmail.com</Text>.
      </Text>
    </ScrollView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 25,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  link: {
    color: "#007AFF",
  },
});
