import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Button, Text } from '@rneui/themed';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function ClientsScreen({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);

  const { insertingAuthData, appCompany } = useSelector((state: RootState) => ({
    insertingAuthData: state.registrationState.insertingAuthData,
    appCompany: state.appCompanyState.appCompany,
  }));

  // insertingAuthData means that database still working on inserting user and/or company
  // If insertingAuthData is false, then it should mean that user and company were fetched correctly and are ready to be used
  useEffect(() => {
    if (insertingAuthData) setLoading(true);
    else {
      // TODO: Only update tables (companies, and user), and fetch user and company here
    }
  }, [insertingAuthData]);

  if (loading) return <ActivityIndicator />;

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
