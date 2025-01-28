import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, {
  useRef,
  useState,
} from "react";
import { Address } from "../../types/Address";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import AddButton from "./AddButton";
import { FlatList } from "react-native-gesture-handler";
import SystemGridItem from "./SystemGridItem";

type Props = {
  address: Address;
};

const AddressCollapsible = ({ address }: Props) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const systems = address.systems ?? [];

  const systemsWithEmptyItem =
    systems.length % 2 === 1 ? [...systems, null] : systems;

  // Create an Animated.Value to control the height
  const heightAnim = useRef(new Animated.Value(0)).current;

  // Function to toggle the height
  const toggleHeight = () => {
    const newHeight = collapsed ? 0 : 178; // Toggle between 50 and 200
    Animated.timing(heightAnim, {
      toValue: newHeight, // Toggle between 50 and 200
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: false, // Height animation is not supported by native driver
    }).start();

    setCollapsed(!collapsed);
  };

  return (
    <View style={[styles.container]}>
      <View style={[globalStyles.row, styles.addressHeader]}>
        <TouchableOpacity onPress={() => systems.length ? toggleHeight() : null}>
          <Text style={globalStyles.textSemiBold}>{address.addressTitle}</Text>
          <Text
            style={[globalStyles.textRegular, { color: AppColors.darkGray }]}
          >
            {address.addressString}
          </Text>
        </TouchableOpacity>
        <OptionsButton type="rectangle" />
      </View>
      <Animated.View
        style={{ height: heightAnim }}
        // onLayout={handleLayout}
      >
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
        >
          Add System
        </AddButton>
      </Animated.View>
    </View>
  );
};

export default AddressCollapsible;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 5,
    gap: 10,
  },
  gridContainer: {
    gap: 10,
  },
  columnWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  addressHeader: {
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  addSystemButton: {
    backgroundColor: AppColors.lightGrayPrimary,
  },
  addSystemText: {
    color: AppColors.darkGray,
  },
});
