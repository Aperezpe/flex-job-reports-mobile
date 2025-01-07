import { ActivityIndicator, StyleSheet } from "react-native";
import React from "react";


const LoadingComponent = () => {
  return <ActivityIndicator testID="loading-indicator" style={styles.container} />;
};

export default LoadingComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
