import { ActivityIndicator, StyleSheet, View } from "react-native";
import React from "react";
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
} from "react-native";

type Props = {
  visible?: boolean;
} & RNModalProps;

const LoadingOverlay = ({ visible }: Props) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </RNModal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent black background
    justifyContent: "center",
    alignItems: "center",
  },
});
