import {
  ActionSheetIOS,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Address } from "../../types/Address";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import AddButton from "./AddButton";
import { FlatList } from "react-native-gesture-handler";
import SystemGridItem from "./SystemGridItem";
import { useDispatch } from "react-redux";
import { removeAddress } from "../../redux/actions/clientDetailsActions";
import AddSystemFormModal from "./AddSystemFormModal";
import { makeStyles } from "@rneui/themed";

const PADDING = 15;
const GRID_GAP = 10;

type Props = {
  address: Address;
  toggleUpsertAddressModal: (address?: Address) => void;
};

const AddressCollapsible = ({ address, toggleUpsertAddressModal }: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const [showAddSystemModal, setShowAddSystemModal] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const systems = address.systems ?? [];

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
            toggleAddSystemModal();
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

  const handleOnAddSystem = () => {
    toggleAddSystemModal();
  };

  const toggleAddSystemModal = () => setShowAddSystemModal(!showAddSystemModal);

  const handleOnDismiss = () => {
    console.log("Erase System form")
  }

  return (
    <View style={[styles.container]}>
      <View style={[globalStyles.row, styles.addressHeader]}>
        <TouchableOpacity
          onPress={() => (systems.length ? toggleCollapsed() : null)}
        >
          <Text style={[globalStyles.textSemiBold, styles.addressTitle]}>{address.addressTitle}</Text>
          <Text
            style={[globalStyles.textRegular, styles.address]}
          >
            {address.addressString}
          </Text>
        </TouchableOpacity>
        <OptionsButton type="rectangle" onPress={handleOnAddressAction} />
      </View>
      <Animated.View style={{ height: collapsed ? 0 : null }}>
        <FlatList
          data={systemsWithEmptyItem}
          numColumns={2}
          renderItem={({ item: system }) => (
            <SystemGridItem key={system?.id} system={system} />
          )}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
        <AddButton
          buttonStyles={styles.addSystemButton}
          textColor={AppColors.darkBluePrimary}
          onPress={handleOnAddSystem}
        >
          Add System
        </AddButton>
      </Animated.View>
      <AddSystemFormModal
        visible={showAddSystemModal}
        onNegative={toggleAddSystemModal}
        onPositive={toggleAddSystemModal}
        addressId={address.id!}
        // onRequestClose={handleOnRequestClose}
        onDismiss={handleOnDismiss}
      />
    </View>
  );
};

export default AddressCollapsible;

const useStyles = makeStyles((theme) => ({
  container: {
    padding: PADDING,
    paddingBottom: 5,
    gap: GRID_GAP,
  },
  gridContainer: {
    gap: GRID_GAP,
    paddingBottom: PADDING,
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
    color: theme.colors.black
  },
  address: {
    color: theme.colors.grey3
  },
  addSystemButton: {
    backgroundColor: AppColors.lightGrayPrimary,
  },
  addSystemText: {
    color: AppColors.darkGray,
  },
}));
