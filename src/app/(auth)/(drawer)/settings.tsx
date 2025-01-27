import { View } from 'react-native'
import React from 'react'
import { Button } from '@rneui/base'
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext'

const Settings = () => {
  const { signOut } = useSupabaseAuth()

  return (
    <View>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  )
}

export default Settings