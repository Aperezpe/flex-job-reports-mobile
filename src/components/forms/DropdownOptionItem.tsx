import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../AddRemoveButton";

type Props = {
  option: string;
  onPress: () => void;
  trailingText?: string;
};

const OptionItem = (props: Props) => {
  const { option, onPress, trailingText } = props;
  return (
    <View style={[globalStyles.row]}>
      <View style={[globalStyles.row]}>
        <Text>{trailingText}</Text>
        <Text>{option}</Text>
      </View>
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

export default OptionItem;
