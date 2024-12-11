import { StyleSheet, View } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseREST } from "../../../context/SupabaseREST.ctx";
import { useSelector } from "react-redux";
import { selectUserAndCompany } from "../../../store/selectors/userAndCompany.selector";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { useSupabaseAuth } from "../../../context/SupabaseAuth.ctx";
import { mapUserSQLToAppUser } from "../../../types/Auth/AppUser";
import { mapCompanySQLToCompany } from "../../../types/Company";
import { setAppCompany } from "../../../store/slices/appCompany.slice";
import { setAppUser } from "../../../store/slices/appUser.slice";
import { Button, Text } from "@rneui/themed";
import { supabase } from "../../../config/supabase";
import { useNavigation, useRouter } from "expo-router";

const Clients = () => {
  const { fetchUserWithCompany } = useSupabaseREST();
  const { authUser } = useSupabaseAuth();
  const navigation = useNavigation()

  const dispatch = useDispatch<AppDispatch>();
  const { appCompany } = useSelector(selectUserAndCompany);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: appCompany?.companyName ?? ''
    })
  }, [appCompany])

  useEffect(() => {
    const fetchData = async (userId: string) => {
      const { data: userWithCompany, error } = await fetchUserWithCompany(
        userId
      );
      if (error) console.log("Error: ", error);

      if (userWithCompany && userWithCompany.company) {
        const user = {
          ...mapUserSQLToAppUser(userWithCompany),
          companyId: userWithCompany.company.id,
        };
        const company = mapCompanySQLToCompany(userWithCompany.company);

        dispatch(setAppCompany(company));
        dispatch(setAppUser(user));
      }
    };

    if (authUser) {
      fetchData(authUser.id);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.verticallySpaced}>
        {/* <Button title="Sign Out" onPress={() => supabase.auth.signOut()} /> */}
      </View>
    </SafeAreaView>
  );
};

export default Clients;

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    alignItems: "center",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
