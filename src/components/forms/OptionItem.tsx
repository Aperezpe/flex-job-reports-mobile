import React from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { globalStyles } from "../../constants/GlobalStyles";
import AddRemoveButton from "../AddRemoveButton";
import { MaterialIcons } from "@expo/vector-icons";
import { useReorderableDrag } from "react-native-reorderable-list";
import { ListContent } from "../../types/FieldEdit";
import { TextInputProps } from "react-native";

type Props = {
  option: ListContent;
  onPress: () => void;
  trailingText?: string;
} & TextInputProps;

const OptionItem = ({
  option,
  onPress,
  trailingText,
  onChangeText,
  onBlur,
}: Props) => {
  const drag = useReorderableDrag();

  return (
    <View style={[globalStyles.row]}>
      <View style={[globalStyles.row, styles.option]}>
        <Text>{trailingText}</Text>
        <TextInput
          style={styles.optionInput}
          onChangeText={onChangeText}
          value={option.value}
          onBlur={onBlur}
        />
      </View>
      <MaterialIcons name="drag-indicator" size={28} onLongPress={drag} />
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

const styles = StyleSheet.create({
  option: {
    flex: 1,
    justifyContent: "flex-start",
  },
  optionInput: {
    flex: 1,
  },
});

export default OptionItem;
