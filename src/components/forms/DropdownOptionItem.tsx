import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../AddRemoveButton";

type Props = {
  option: string;
  onPress: () => void;
};

const OptionItem = (props: Props) => {
  const { option, onPress } = props;
  return (
    <View style={[globalStyles.row]}>
      <Text>{option}</Text>
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
