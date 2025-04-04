import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import { DropdownOption } from "../Inputs/CustomDropdown";
import AddRemoveButton from "../AddRemoveButton";

type Props = {
  option: DropdownOption;
  onPress: () => void;
};

const DropdownOptionItem = (props: Props) => {
  const { option, onPress } = props;
  return (
    <View style={[globalStyles.row]}>
      <Text>{option.label}</Text>
      <AddRemoveButton
        remove
        color={"white"}
        backgroundColor="red"
        onPress={onPress}
        size={18}
      />
    </View>
  );
};

export default DropdownOptionItem;
