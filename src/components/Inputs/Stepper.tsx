import { Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../../constants/GlobalStyles";
import { Entypo } from "@expo/vector-icons";
import { makeStyles } from "@rneui/themed";

type Props = {
  label?: string;
  onChange: (text: string) => void;
};

const Stepper = ({ label, onChange }: Props) => {
  const [value, setValue] = useState<number>(0);
  const styles = useStyles();

  const handleAddition = (num: number) => {
    if (value === 0 && num < 0) return;
    setValue((value) => value + num);
    onChange(value.toFixed(1).toString())
  };

  return (
    <View style={[globalStyles.row, styles.container]}>
      <Text>{label}</Text>
      <View style={globalStyles.row}>
        <TouchableOpacity
          style={[styles.button, styles.buttonMinus]}
          onPress={() => handleAddition(-0.5)}
        >
          <Entypo name="minus" size={18} />
        </TouchableOpacity>
        <Text style={styles.value} >{value.toFixed(1).toString()}</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonPlus]}
          onPress={() => handleAddition(+0.5)}
        >
          <Entypo name="plus" size={18} color={styles.buttonPlus.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Stepper;

const useStyles = makeStyles((theme) => ({
  container: {
    paddingHorizontal: 5,
  },
  button: {
    padding: 12,
    borderRadius: 50,

    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: { width: 1, height: 4 },
  },
  buttonMinus: {
    backgroundColor: theme.colors.grey5,
  },
  buttonPlus: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.grey5,
  },
  value: {
    textAlign: "center",
    width: 50,
  },
}));
