import { View, Text, SwitchProps } from "react-native";
import React, { useState } from "react";
import { makeStyles, Switch } from "@rneui/themed";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {
  label: string;
} & SwitchProps;

const SwitchInput = ({ label, onValueChange, value: parentValue, style }: Props) => {
  const styles = useStyles();
  const [value, setValue] = useState(false);
  return (
    <View style={[globalStyles.row, style]}>
      <Text style={globalStyles.textRegular}>{label}</Text>
      <Switch
        onValueChange={onValueChange ?? setValue}
        value={parentValue ?? value}
        color={styles.switch.color}
      />
    </View>
  );
};

export default SwitchInput;

const useStyles = makeStyles((theme) => ({
  switch: {
    color: theme.colors.platform.ios.success,
  },
}));
