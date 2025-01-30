import React, { useEffect, useState } from "react";
import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  StyleProp,
  ViewStyle,
  Animated,
} from "react-native";
import { globalConsts } from "../constants/GlobalConsts";
import { AppColors } from "../constants/AppColors";

export type ModalProps = {
  withInput?: boolean;
  modalViewStyles?: StyleProp<ViewStyle>;
} & RNModalProps;

const Modal = ({
  withInput,
  children,
  modalViewStyles,
  visible,
  onRequestClose,
  onDismiss,
  onShow
}: ModalProps) => {
  const [slideAnim] = useState(new Animated.Value(500)); // Start below screen (for slide-up)
  const [overlayAnim] = useState(new Animated.Value(0)); // Start with transparent background
  const [isVisible, setIsVisible] = useState(visible);

  // When the modal's visibility changes, trigger animation
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Slide up the modal and fade in the overlay
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to the original position (bottom to top)
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1, // Fade in the background overlay
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down the modal and fade out the overlay
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 500, // Move down (slide out)
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0, // Fade out the background overlay
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsVisible(false)); // After animations, hide the modal
    }
  }, [visible, slideAnim, overlayAnim]);

  const content: JSX.Element = withInput ? (
    <KeyboardAvoidingView
      style={styles.centeredView}
      behavior={Platform.OS ? "padding" : "height"}
    >
      <View style={[styles.modalView, modalViewStyles]}>{children}</View>
    </KeyboardAvoidingView>
  ) : (
    <View style={styles.centeredView}>
      <View style={[styles.modalView, modalViewStyles]}>{children}</View>
    </View>
  );

  return (
    <RNModal
      animationType="none" // Disable default animation to use custom animations
      transparent
      visible={isVisible}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
      onShow={onShow}
    >
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]} // Fade effect for background
      >
        <Animated.View
          style={[{ transform: [{ translateY: slideAnim }] }, styles.centeredView]} // Slide-up effect for modal
        >
          {content}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

export default Modal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: AppColors.whitePrimary,
    borderRadius: globalConsts.modalBorderRadius,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
});
