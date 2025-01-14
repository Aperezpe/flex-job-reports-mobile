import {
  Modal as RNModal,
  ModalProps as RNModalProps,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import React, { PropsWithChildren, useEffect } from "react";
import { globalConsts } from "../constants/GlobalConsts";
import { AppColors } from "../constants/AppColors";

export type ModalProps =  {   
  withInput?: boolean;
  modalViewStyles?: StyleProp<ViewStyle>;
} & RNModalProps & PropsWithChildren;

const Modal = ({ withInput, children, modalViewStyles, visible, onRequestClose }: ModalProps) => {
  useEffect(() => {
    console.log("re-rendered");
  })
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
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
      
    >
      <View style={styles.overlay}>
        {content}
      </View>
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
