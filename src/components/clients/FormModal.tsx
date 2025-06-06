import { Text, TouchableOpacity, View } from "react-native";
import React, { PropsWithChildren } from "react";
import Modal, { ModalProps } from "../Modal";
import { AppColors } from "../../constants/AppColors";
import { globalConsts } from "../../constants/GlobalConsts";
import { makeStyles } from "@rneui/themed";
import { Divider } from "@rneui/base";

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
  onShow,
  modalViewStyles
}: FormModalProps) => {
  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      withInput={true}
      modalViewStyles={[styles.modalViewStyles, modalViewStyles]}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
      onShow={onShow}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Divider style={{ marginTop: 8, marginBottom: 20 }} />
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

const useStyles = makeStyles((theme) => ({
  modalViewStyles: {
    width: "90%",
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  modalContent: {
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: theme.colors.black,
  },
  buttons: {
    flexDirection: "row",
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    borderTopColor: theme.colors.greyOutline,
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
    borderBottomLeftRadius: globalConsts.MODAL_BORDER_RADIUS,
  },
  buttonRight: {
    backgroundColor: AppColors.darkBluePrimary,
    borderBottomEndRadius: globalConsts.MODAL_BORDER_RADIUS,
  },
}));
