import React from "react";
import { ScrollView, StyleSheet, View, Linking } from "react-native";
import { Text, Button } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpSupportScreen = () => {
  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@flexjobreports.com");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text h4 style={styles.title}>
          Help & Support
        </Text>

        <Text style={styles.paragraph}>
          We're here to help! If you have questions about using the app,
          encounter issues, or want to send feedback, check below or contact us
          directly.
        </Text>

        <Text style={styles.sectionTitle}>🛠 Common Issues</Text>
        <Text style={styles.paragraph}>
          • Can’t log in? Double-check your email and password.{"\n"}• Sync
          issues? Try closing and reopening the app.{"\n"}• Job report not
          saving? Ensure all required fields are filled.
        </Text>

        <Text style={styles.sectionTitle}>📘 Getting Started</Text>
        <Text style={styles.paragraph}>
          • Tap **Start Ticket** from the menu to begin a new job report.{"\n"}•
          Use **Client Reports** to view history by customer.{"\n"}• Need to add
          fields? Go to the report editor and tap "Add Field".
        </Text>

        <Text style={styles.sectionTitle}>📨 Contact Support</Text>
        <Text style={styles.paragraph}>
          For direct support, email us and we'll respond as soon as possible.
        </Text>
        <Button title="Email Support" onPress={handleEmailSupport} />

        <Text style={styles.sectionTitle}>💡 Feedback</Text>
        <Text style={styles.paragraph}>
          We’d love to hear your suggestions or improvements. Just send us an
          email!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

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
    marginBottom: 10,
  },
});
