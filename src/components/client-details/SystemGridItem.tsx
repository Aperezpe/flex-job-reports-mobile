import {
  ActionSheetIOS,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { System } from "../../types/System";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import { AntDesign } from "@expo/vector-icons";
import { makeStyles } from "@rneui/themed";
import SystemFormModal from "./SystemFormModal";
import { useDispatch } from "react-redux";
import { removeSystem } from "../../redux/actions/clientDetailsActions";
import StartReportModal from "./StartReportModal";
import { Address } from "../../types/Address";
import useToggleModal from "../../hooks/useToggleModal";
import { useSelector } from "react-redux";
import { selectSystemTypes } from "../../redux/selectors/sessionDataSelectors";
import { getSystemTypeName } from "../../types/SystemType";

type Props = {
  system: System | null; // Uses null to show transparent grid item when systems.length === 1
  address: Address;
};

const SystemGridItem = ({ system, address }: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const systemTypes = useSelector(selectSystemTypes) || [];

  const { visible: showReportModal, toggleModal: toggleReportModal } =
    useToggleModal();
  const { visible: showAddSystemModal, toggleModal: toggleAddSystemModal } =
    useToggleModal();

  const handleRemoveConfirm = () => {
    if (system?.id)
      dispatch(
        removeSystem({ addressId: system.addressId!, systemId: system.id })
      );
  };

  const handleSystemAction = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Edit System", "Delete System"],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1:
            toggleAddSystemModal();
            break;
          case 2:
            Alert.alert(
              "Are you sure?",
              `${system?.systemName} will be deleted`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Confirm",
                  onPress: handleRemoveConfirm,
                  style: "destructive",
                },
              ]
            );
            break;
        }
      }
    );
  };

  const calculateLastService = (lastService?: string) => {
    if (lastService) {
      const today = new Date();
      const lastServiceDate = new Date(lastService);

      const diffTime = today.getTime() - lastServiceDate.getTime();
      const days = Math.floor(Math.abs(diffTime / (1000 * 60 * 60 * 24)));

      const years = Math.floor(days / 365);
      const months = Math.floor(days / 30);
      const weeks = Math.floor(days / 7);

      if (years > 0) {
        const yearString = years > 1 ? "years" : "year";
        return `${years} ${yearString} ago`;
      } else if (months > 0) {
        const monthString = months > 1 ? "months" : "month";
        return `${months} ${monthString} ago`;
      } else if (weeks > 0) {
        const weekString = weeks > 1 ? "weeks" : "week";
        return `${weeks} ${weekString} ago`;
      } else if (days > 0) {
        const dayString = days > 1 ? "days" : "day";
        return `${days} ${dayString} ago`;
      } else if (days === 0) {
        return "Today";
      }
    }
    return "Last Service: N/A";
  };

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => system && toggleReportModal()}
    >
      {system && (
        <View style={styles.container}>
          <View style={[globalStyles.row]}>
            <Text
              numberOfLines={1}
              style={[globalStyles.textBold, styles.systemTitle]}
            >
              {system?.systemName}
            </Text>
            <OptionsButton
              type="rectangle"
              borderRadius={5}
              onPress={handleSystemAction}
            />
          </View>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {getSystemTypeName(systemTypes, system?.systemTypeId)}
          </Text>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {system?.area}
          </Text>
          <Text style={[globalStyles.textRegular, styles.systemText]}>
            {system?.tonnage} lbs
          </Text>
          <View style={[globalStyles.row, styles.lastServicedContainer]}>
            <AntDesign name="clockcircle" color={AppColors.grayPlaceholder} />
            <Text style={[globalStyles.textSemiBold, styles.lastServicedText]}>
              {calculateLastService(system?.lastService)}
            </Text>
          </View>
        </View>
      )}
      <StartReportModal
        visible={showReportModal}
        onClose={toggleReportModal}
        system={system}
        address={address}
      />
      <SystemFormModal
        visible={showAddSystemModal}
        onNegative={toggleAddSystemModal}
        onPositive={toggleAddSystemModal}
        addressId={system?.addressId}
        system={system}
      />
    </TouchableOpacity>
  );
};

export default SystemGridItem;

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    borderColor: AppColors.lightGraySecondary,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  systemTitle: {
    flex: 1,
    fontSize: 15,
    paddingEnd: 3,
    color: theme.colors.black,
  },
  systemText: {
    color: theme.colors.grey3,
    fontSize: 12,
  },
  lastServicedContainer: {
    gap: 5,
  },
  lastServicedText: {
    fontSize: 12,
    color: AppColors.grayPlaceholder,
  },
}));
