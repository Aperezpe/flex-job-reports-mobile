import React from "react";
import { View, StyleSheet } from "react-native";
import Modal from "../../Modal";
import { globalStyles } from "../../../constants/GlobalStyles";
import ButtonText from "../../ButtonText";


type PickerModalProps = {
  visible: boolean;
  onCancel: () => void;
  onDone: () => void;
  children: React.ReactNode;
};

const PickerModal = ({ visible, onCancel, onDone, children }: PickerModalProps) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={onCancel}
      position="bottom"
      modalViewStyles={styles.modalContainer}
    >
      <View style={{ flexGrow: 1 }}>
        <View style={[globalStyles.row, styles.pickerHeader]}>
          <ButtonText onPress={onCancel}>Cancel</ButtonText>
          <ButtonText bold onPress={onDone}>
            Done
          </ButtonText>
        </View>
        <View style={styles.pickerContainer}>{children}</View>
      </View>
    </Modal>
  );
};

export default PickerModal;

const styles = StyleSheet.create({
  pickerHeader: {
    padding: 8,
    backgroundColor: "#fff",
    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  modalContainer: {
    flexDirection: "row",
    borderRadius: 0,
    padding: 0,
  },
  pickerContainer: {
    alignItems: "center",
  },
});