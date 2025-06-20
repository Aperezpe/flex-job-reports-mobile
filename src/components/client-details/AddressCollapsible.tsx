import {
  ActionSheetIOS,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Address } from "../../types/Address";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import CustomButton from "../CustomButton";
import { FlatList } from "react-native-gesture-handler";
import SystemGridItem from "./SystemGridItem";
import { useDispatch } from "react-redux";
import { removeAddress } from "../../redux/actions/clientDetailsActions";
import SystemFormModal from "./SystemFormModal";
import { makeStyles } from "@rneui/themed";
import { useSelector } from "react-redux";
import { selectAllSystemTypes } from "../../redux/selectors/sessionDataSelectors";
import { useRouter } from "expo-router";
import useToggleModal from "../../hooks/useToggleModal";
import { Entypo } from "@expo/vector-icons";

const GRID_GAP = 10;

type Props = {
  address: Address;
  toggleUpsertAddressModal: (address?: Address) => void;
};

const AddressCollapsible = ({ address, toggleUpsertAddressModal }: Props) => {
  const styles = useStyles();
  const router = useRouter();
  const systemTypes = useSelector(selectAllSystemTypes);
  const systems = address.systems ?? [];
  const dispatch = useDispatch();
  const { visible, toggleModal } = useToggleModal();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Ensure systems length is even for grid layout
  const systemsWithEmptyItem =
    systems.length % 2 === 1 ? [...systems, null] : systems;

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const handleRemoveConfirm = () => {
    if (address.id) dispatch(removeAddress(address.id));
  };

  const handleOnAddressAction = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Add System", "Edit Address", "Delete Address"],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1:
            onToggleAddSystemModal();
            break;
          case 2:
            toggleUpsertAddressModal(address);
            break;
          case 3:
            Alert.alert(
              "Are you sure?",
              "The address and systems will be deleted",
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

  const onToggleAddSystemModal = () => {
    if (systemTypes.length) {
      toggleModal();
    } else {
      showNoSystemsAlert();
    }
  };

  const showNoSystemsAlert = () =>
    Alert.alert("No Systems Found", "You need to add a system", [
      {
        text: "Manage Systems",
        isPreferred: true,
        onPress: () => {
          router.dismissAll();
          router.push("/(auth)/(drawer)/forms");
        },
      },
      { text: "Cancel" },
    ]);

  return (
    <View style={[styles.container]}>
      <View style={[globalStyles.row, styles.addressHeader]}>
        <TouchableOpacity
          onPress={() => (systems.length ? toggleCollapsed() : {})}
        >
          <Text style={[globalStyles.textSemiBold, styles.addressTitle]}>
            {address.addressString}
          </Text>
        </TouchableOpacity>
        <OptionsButton type="rectangle" onPress={handleOnAddressAction} />
      </View>
      <View style={{ height: collapsed ? 0 : "auto" }}>
        <FlatList
          data={systemsWithEmptyItem}
          numColumns={2}
          renderItem={({ item: system }) => (
            <SystemGridItem
              key={system?.id}
              system={system}
              address={address}
            />
          )}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
      <CustomButton primary onPress={onToggleAddSystemModal}>
        <Entypo name="plus" size={18} color={AppColors.darkBluePrimary} />
        Add System
      </CustomButton>

      <SystemFormModal
        visible={visible}
        onNegative={onToggleAddSystemModal}
        onPositive={onToggleAddSystemModal}
        addressId={address.id}
      />
    </View>
  );
};

export default AddressCollapsible;

const useStyles = makeStyles((theme) => {
  return {
    container: {
      padding: 15,
      gap: GRID_GAP,
    },
    gridContainer: {
      gap: GRID_GAP,
      paddingBottom: 5,
    },
    columnWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: GRID_GAP,
    },
    addressHeader: {
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    addressTitle: {
      color: theme.colors.black,
    },
    address: {
      color: theme.colors.grey3,
    },

    addSystemText: {
      color: AppColors.darkGray,
    },
  };
});
