import { TouchableOpacity, View } from "react-native";
import React from "react";
import Modal, { ModalProps } from "../Modal";
import { globalStyles } from "../../constants/GlobalStyles";
import { Divider, makeStyles, Text } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";
import InfoText from "./InfoText";
import { System } from "../../types/System";
import { Address } from "../../types/Address";

type Props = {
  onClose: () => void;
  system: System | null;
  address: Address;
} & ModalProps;

const StartReportModal = ({
  visible,
  // onPositive,
  onClose,
  onRequestClose,
  onDismiss,
  onShow,
  system,
  address,
}: Props) => {
  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      // withInput={true}
      modalViewStyles={styles.modalViewStyles}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
      onShow={onShow}
    >
      <View style={styles.modalContentContainer}>
        <View style={[globalStyles.row]}>
          <Text style={styles.modalTitle}>Start New Report</Text>
          <AntDesign name="close" size={18} onPress={onClose} />
        </View>
        <Text style={[globalStyles.textRegular, styles.modalSubtitle]}>
          {system?.systemType} report
        </Text>
        <Divider style={{ marginTop: 10 }} />

        <View style={styles.modalContent}>
          <Text style={[globalStyles.textBold, styles.infoTitle]}>
            System Info
          </Text>

          <View style={styles.infoContainer}>
            <InfoText label={"Name"} value={system?.systemName} />
            <InfoText label={"Type"} value={system?.systemType} />
            <InfoText label={"Area"} value={system?.area} />
            <InfoText label={"Tonnage"} value={system?.tonnage?.toFixed(1)} />
          </View>

          <Text style={[globalStyles.textBold, styles.infoTitle]}>
            Address Info
          </Text>

          <View style={styles.infoContainer}>
            <InfoText label={"Name"} value={address.addressTitle} />
            <InfoText label={"Address"} value={address.addressString} />
          </View>

          <TouchableOpacity style={styles.startReportButton}>
            <Text
              style={[globalStyles.textSubtitle, styles.startReportButtonText]}
            >
              Start Report
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StartReportModal;

const useStyles = makeStyles((theme) => ({
  modalViewStyles: {
    minWidth: '90%',
    marginHorizontal: 18,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  modalContentContainer: {
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  modalContent: {
  },
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: theme.colors.black,
  },
  modalSubtitle: {
    color: theme.colors.grey3,
  },
  infoContainer: {
    borderRadius: 10,
    backgroundColor: theme.colors.highlightOpacity,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoTitle: {
    paddingTop: 20,
    paddingBottom: 8
  },
  buttons: {
    flexDirection: "row",
    maxWidth: "90%",
    // minWidth: '80%',
  },
  startReportButton: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: theme.colors.secondary,
    marginTop: 24,
  },
  startReportButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: AppColors.whitePrimary,
  },
}));
