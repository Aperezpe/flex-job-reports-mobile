import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../../constants/GlobalStyles";

type Props = {
  label: string;
  value?: string;
};

const InfoText = ({ label, value }: Props) => {
  return (
    <>
      {value && (
        <View style={[globalStyles.row, styles.infoTextContainer]}>
          <Text style={globalStyles.textBold}>{label}: </Text>
          <Text>{value}</Text>
        </View>
      )}
    </>
  );
};

export default InfoText;

const styles = StyleSheet.create({
  infoTextContainer: {
    flexWrap: 'wrap',
    justifyContent: "flex-start",
  },
});
