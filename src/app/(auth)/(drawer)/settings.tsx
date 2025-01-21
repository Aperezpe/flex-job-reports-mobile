import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from '@rneui/base'
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext'

type Props = {}

const Settings = (props: Props) => {
  const { signOut } = useSupabaseAuth()

  return (
    <View>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({})