import { StyleSheet } from "react-native";
import React from "react";
import { TabProps } from "@rneui/base";
import { globalStyles } from "../../constants/GlobalStyles";
import { ScrollView } from "react-native-gesture-handler";

type Props = {} & TabProps;

const AppTab = ({ value, onChange, children, containerStyle }: Props) => {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={[globalStyles.row, styles.container]}
    >
      {children}
    </ScrollView>
  );
};

export default AppTab;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 25,
    paddingHorizontal: 25,
    gap: 18,
    // flex: 1,
    justifyContent: 'flex-start',
  },
});
