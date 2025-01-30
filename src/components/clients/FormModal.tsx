import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { PropsWithChildren } from "react";
import Modal, { ModalProps } from "../Modal";
import { AppColors } from "../../constants/AppColors";
import { globalConsts } from "../../constants/GlobalConsts";

export type FormModalProps = {
  title?: string;
  onPositive?: () => void;
  onNegative?: () => void;
  loading?: boolean;
} & ModalProps & PropsWithChildren;

const FormModal = ({
  visible,
  onNegative,
  onPositive,
  title,
  children,
  loading,
  onRequestClose,
  onDismiss,
  onShow
}: FormModalProps) => {

  return (
    <Modal
      visible={visible}
      withInput={true}
      modalViewStyles={styles.modalViewStyles}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
      onShow={onShow}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        {children}
      </View>
      <View style={styles.buttons}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onNegative}
            style={[styles.button, styles.buttonLeft]}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.buttonLeftText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onPositive}
            style={[styles.button, styles.buttonRight]}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.buttonRightText]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FormModal;

const styles = StyleSheet.create({
  modalViewStyles: {
    width: "90%",
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  modalContent: {
    gap: 18,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
  buttons: {
    flexDirection: "row",
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    borderTopColor: AppColors.lightGraySecondary,
    borderTopWidth: 1,
  },
  button: {
    padding: 12,
  },
  buttonText: {
    textAlign: "center",
    fontFamily: "Monda_700Bold",
    fontSize: 16,
  },
  buttonLeftText: {
    color: AppColors.darkBluePrimary,
  },
  buttonRightText: {
    color: AppColors.whitePrimary,
  },
  buttonLeft: {
    backgroundColor: AppColors.lightGrayPrimary,
    borderBottomLeftRadius: globalConsts.modalBorderRadius,
  },
  buttonRight: {
    backgroundColor: AppColors.darkBluePrimary,
    borderBottomEndRadius: globalConsts.modalBorderRadius,
  },
});
