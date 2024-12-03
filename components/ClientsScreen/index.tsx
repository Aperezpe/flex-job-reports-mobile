import { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, SafeAreaView } from 'react-native'
import { Button, Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../../config/supabase'
import { useSupabaseAuth } from '../../context/SupabaseAuth.ctx'

export default function ClientsScreen({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const { user } = useSupabaseAuth()

  useEffect(() => {
    if (session) getUserData()
  }, [session])

  async function getUserData() {
    try {
      setLoading(true)
      
      if (!session?.user) throw new Error('No user on the session!')
      if (!user) throw new Error('No user found in db')

      setName(user.email ?? '')
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // async function updateProfile({
  //   username,
  //   website,
  //   avatar_url,
  // }: {
  //   username: string
  //   website: string
  //   avatar_url: string
  // }) {
  //   try {
  //     setLoading(true)
  //     if (!session?.user) throw new Error('No user on the session!')

  //     const updates = {
  //       id: session?.user.id,
  //       username,
  //       website,
  //       avatar_url,
  //       updated_at: new Date(),
  //     }

  //     const { error } = await supabase.from('profiles').upsert(updates)

  //     if (error) {
  //       throw error
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       Alert.alert(error.message)
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <SafeAreaView style={styles.container}>
      <Text h2>Hello {name}!</Text>
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    alignItems: 'center'
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})