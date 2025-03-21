import { Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../constants/GlobalStyles";
import { makeStyles } from "@rneui/themed";

export type InfoText = {
  label: string;
  value?: string | number;
};

type Props = {
  title: string;
  infoList: InfoText[];
};

const InfoSection = ({ title, infoList }: Props) => {
  const styles = useStyles();
  return (
    <>
      <Text style={[globalStyles.textBold, styles.infoTitle]}>{title}</Text>
      <View style={styles.infoContainer}>
        {infoList.map((info, i) => (
          <View key={i} style={[globalStyles.row, styles.infoTextContainer]}>
            {info.value && (
              <>
                <Text style={globalStyles.textBold}>{info.label}: </Text>
                <Text>{info.value}</Text>
              </>
            )}
          </View>
        ))}
      </View>
    </>
  );
};

export default InfoSection;

const useStyles = makeStyles((theme) => ({
  infoTitle: {
    paddingTop: 20,
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
