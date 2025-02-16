import { View } from "react-native";
import React from "react";
import { Button, Text } from "@rneui/themed";
import { useSupabaseAuth } from "../../../context/SupabaseAuthContext";
import { useSelector } from "react-redux";
import { selectAppCompanyAndUser } from "../../../redux/selectors/sessionDataSelectors";
import { globalStyles } from "../../../constants/GlobalStyles";
import { useNavigation } from "expo-router";

const Settings = () => {
  const { signOut } = useSupabaseAuth();
  const { appCompany } = useSelector(selectAppCompanyAndUser);

  return (
    <View>
      <Text style={globalStyles.textRegular}>
        <Text style={globalStyles.textBold}>Company Name:{' '}</Text> 
        {appCompany?.companyName}
      </Text>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  );
};

export default Settings;
