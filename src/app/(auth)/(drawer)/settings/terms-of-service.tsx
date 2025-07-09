import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const TermsAndConditionsScreen = () => {
  const router = useRouter();
  const handleAccept = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text h4 style={styles.title}>
          Terms and Conditions
        </Text>

        <Text style={styles.paragraph}>
          Welcome to our app. Please read the following terms and conditions
          carefully before using our services. By using this app, you agree to
          be bound by these terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using our app, you acknowledge that you have read,
          understood, and agree to be bound by these terms.
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your
          account and password and for restricting access to your device.
        </Text>

        <Text style={styles.sectionTitle}>3. Modifications</Text>
        <Text style={styles.paragraph}>
          We reserve the right to update or modify these terms at any time
          without prior notice. Your continued use of the app constitutes your
          acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>4. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these terms, please contact us at
          support@example.com.
        </Text>

        <Button title="Accept" onPress={handleAccept} containerStyle={styles.button} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;

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
    marginBottom: 20,
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
  button: {
    marginTop: 30,
  },
});
