import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import CustomButton from "../CustomButton";
import { DropdownOption } from "../Inputs/CustomDropdown";
import { makeStyles } from "@rneui/themed";

type Props = {
  option: DropdownOption;
  onPress: () => void;
};

const DropdownOptionItem = (props: Props) => {
  const styles = useStyles();

  const { option, onPress } = props;
  return (
    <View style={[globalStyles.row]}>
      <Text>{option.label}</Text>
      <CustomButton
        remove
        circle
        buttonContainerStyle={styles.removeButton}
        iconColor={"white"}
        onPress={onPress}
      />
    </View>
  );
};

export default DropdownOptionItem;

const useStyles = makeStyles((theme) => ({
  removeButton: {
    backgroundColor: theme.colors.error,
  },
}));
