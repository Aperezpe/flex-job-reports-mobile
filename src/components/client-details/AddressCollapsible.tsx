import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Address } from "../../types/Address";
import { globalStyles } from "../../constants/GlobalStyles";
import OptionsButton from "../OptionsButton";
import { AppColors } from "../../constants/AppColors";
import AddButton from "./AddButton";
import { FlatList } from "react-native-gesture-handler";
import { System } from "../../types/System";
import SystemGridItem from "./SystemGridItem";

type Props = {
  address: Address;
};

const AddressCollapsible = ({ address }: Props) => {
  // const [collapsed, setCollapsed] = useState(true);

  // const [systems, setSystems] = useState<System[]>([])
  const systems: System[] = [];
  return (
    <View style={[styles.container]}>
      <View style={[globalStyles.row, styles.addressHeader]}>
        <View>
          <Text style={globalStyles.textSemiBold}>{address.addressTitle}</Text>
          <Text style={[globalStyles.textRegular, { color: AppColors.darkGray }]}>{address.addressString}</Text>
        </View>
        <OptionsButton type="rectangle" />
      </View>
      <FlatList
        data={systems}
        numColumns={2}
        renderItem={({ item: system }) => (
          <SystemGridItem key={system.id} system={system} />
        )}
        contentContainerStyle={{ gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
      />
      <AddButton buttonStyles={styles.addSystemButton} textColor={AppColors.darkBluePrimary}>Add System</AddButton>
    </View>
  );
};

export default AddressCollapsible;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 15
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
  }
});
