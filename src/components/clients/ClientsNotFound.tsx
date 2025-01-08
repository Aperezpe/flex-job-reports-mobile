import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { globalStyles } from '../../constants/GlobalStyles'

type Props = {}

const ClientsNotFound = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text style={globalStyles.textRegular}>Clients Not Found</Text>
    </View>
  )
}

export default ClientsNotFound

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})