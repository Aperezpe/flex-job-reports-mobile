import { useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { Button, Text } from '@rneui/themed';
import { supabase } from '../../config/supabase';
import { useSupabaseREST } from '../../context/SupabaseREST.ctx';
import { useSelector } from 'react-redux';
import { useSupabaseAuth } from '../../context/SupabaseAuth.ctx';
import { mapCompanySQLToCompany } from '../../types/Company';
import { mapUserSQLToAppUser } from '../../types/Auth/AppUser';
import { setAppUser } from '../../store/slices/appUser.slice';
import { setAppCompany } from '../../store/slices/appCompany.slice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { selectUserAndCompany } from '../../store/selectors/userAndCompany.selector';
import { Redirect, useNavigation, useRouter } from 'expo-router';

export default function ClientsScreen() {
  const navigation = useNavigation();
  const { fetchUserWithCompany } = useSupabaseREST();
  const { appCompany } = useSelector(selectUserAndCompany);
  const dispatch = useDispatch<AppDispatch>();
  const { authUser, signOut, isLoading, session } = useSupabaseAuth();

  if (isLoading) return <ActivityIndicator />
  else if (!session) return <Redirect href="/login" />

  useEffect(() => {
    const fetchData = async (userId: string) => {
      const { data: userWithCompany, error } = await fetchUserWithCompany(userId);
      if (error) console.log('Error: ', error);

      if (userWithCompany && userWithCompany.company) {
        const user = {
          ...mapUserSQLToAppUser(userWithCompany),
          companyId: userWithCompany.company.id,
        };
        const company = mapCompanySQLToCompany(userWithCompany.company);

        dispatch(setAppCompany(company));
        dispatch(setAppUser(user));

        navigation.setOptions({ title: company.companyName })
      }
    };

    if (authUser) {
      fetchData(authUser.id);
    }
  }, []);

  if (!appCompany)
    return (
      <SafeAreaView>
        <ActivityIndicator />
        <Button title='Sign Out' onPress={() => supabase.auth.signOut()} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text h2>{appCompany?.companyName}</Text>
      <View style={styles.verticallySpaced}>
        <Button title='Sign Out' onPress={() => supabase.auth.signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
