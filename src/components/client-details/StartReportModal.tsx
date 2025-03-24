import { TouchableOpacity, View } from "react-native";
import React from "react";
import Modal, { ModalProps } from "../Modal";
import { globalStyles } from "../../constants/GlobalStyles";
import { Divider, makeStyles, Text } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";
import { System } from "../../types/System";
import { Address } from "../../types/Address";
import InfoSection, { InfoText } from "../InfoSection";
import { useRouter } from "expo-router";

type Props = {
  onClose: () => void;
  system: System | null;
  address: Address;
} & ModalProps;

const StartReportModal = ({
  visible,
  onClose,
  onRequestClose,
  onDismiss,
  onShow,
  system,
  address,
}: Props) => {
  const styles = useStyles();
  const router = useRouter();

  const systemInfo: InfoText[] = [
    {
      label: "Name",
      value: system?.systemName,
    },
    {
      label: "Type",
      value: system?.systemType,
    },
    {
      label: "Area",
      value: system?.area,
    },
    {
      label: "Tonnage",
      value: system?.tonnage,
    },
  ];

  const addressInfo: InfoText[] = [
    {
      label: "Name",
      value: address.addressTitle,
    },
    {
      label: "Address",
      value: address.addressString,
    },
  ];

  const onStartReport = () => {
    onClose();
    setTimeout(() => {
      router.push(`clients/report/${system?.id}`);
    }, 250);
  };

  return (
    <Modal
      visible={visible}
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
          <InfoSection title={"System Info"} infoList={systemInfo} />
          <InfoSection title={"Address Info"} infoList={addressInfo} />

          <TouchableOpacity
            style={styles.startReportButton}
            onPress={onStartReport}
          >
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
    minWidth: "90%",
    marginHorizontal: 18,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  modalContentContainer: {
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  modalContent: {},
  modalTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: theme.colors.black,
  },
  modalSubtitle: {
    color: theme.colors.grey3,
  },

  buttons: {
    flexDirection: "row",
    maxWidth: "90%",
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
