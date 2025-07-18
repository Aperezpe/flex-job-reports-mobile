import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text h4 style={styles.title}>
          Privacy Policy
        </Text>

        <Text style={styles.paragraph}>
          Effective Date: July 8, 2025
        </Text>

        <Text style={styles.paragraph}>
          Flex Job Reports (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          • Personal Information: name, email, company name, and other details you provide when setting up your account.{"\n"}
          • Job Data: job reports, photos, notes, and system details submitted through the app.{"\n"}
          • Device Data: basic device info for diagnostics and support.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          • To create and manage your account{"\n"}
          • To store and organize your job reports securely{"\n"}
          • To improve app features and troubleshoot bugs{"\n"}
          • To contact you with updates or support messages
        </Text>

        <Text style={styles.sectionTitle}>3. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell or rent your personal information. We may share your data with service providers (e.g., Supabase) only to support app functionality, and always with proper safeguards.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage</Text>
        <Text style={styles.paragraph}>
          Your data is securely stored using Supabase cloud services. You can request data deletion at any time by contacting us.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          • Access your data{"\n"}
          • Request deletion{"\n"}
          • Update or correct your information
        </Text>

        <Text style={styles.sectionTitle}>6. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions about this policy, contact us at{" "}
          <Text style={styles.link}>aperezpe01@gmail.com</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
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
