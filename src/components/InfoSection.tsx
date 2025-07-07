import { StyleProp, Text, TextStyle, View } from "react-native";
import React from "react";
import { globalStyles } from "../constants/GlobalStyles";
import { makeStyles } from "@rneui/themed";
import FieldTitle from "./forms/FieldTitle";

export type InfoText = {
  label?: string;
  value?: string | number;
};

type Props = {
  title?: string;
  infoList: InfoText[];
  titleStyles?: StyleProp<TextStyle>
};

const InfoSection = ({ title, infoList, titleStyles }: Props) => {
  const styles = useStyles();
  return (
    <View>
      <FieldTitle style={[styles.infoTitle, titleStyles]}>{title}</FieldTitle>
      <View style={styles.infoContainer}>
        {infoList.map((info, i) => (
          <View key={i} style={[globalStyles.row, styles.infoTextContainer]}>
            {info.value && (
              <>
                <Text style={globalStyles.textBold}>{info.label && info.label + ": "}</Text>
                <Text>{info.value}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default InfoSection;

const useStyles = makeStyles((theme) => ({
  infoTitle: {
    paddingBottom: 8,
  },
  infoContainer: {
    borderRadius: 10,
    backgroundColor: theme.colors.highlightOpacity,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoTextContainer: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
}));
