import { TouchableOpacity, View } from "react-native";
import React from "react";
import Modal, { ModalProps } from "../Modal";
import { globalStyles } from "../../constants/GlobalStyles";
import { Divider, makeStyles, Text } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import { AppColors } from "../../constants/AppColors";
import { System } from "../../types/System";
import { Address } from "../../types/Address";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { selectAllSystemTypes } from "../../redux/selectors/sessionDataSelectors";
import { getSystemTypeName } from "../../types/SystemType";
import DefaultReportInfo from "../shared/DefaultReportInfo";

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
  const systemTypes = useSelector(selectAllSystemTypes);
  // const clientDetails = useSelector(selectClientDetails);

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
          {getSystemTypeName(systemTypes, system?.systemTypeId)} report
        </Text>
        <Divider style={{ marginTop: 10 }} />

        <>
          <DefaultReportInfo system={system} address={address} />
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
        </>
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
