import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type Props = {}

const EmptyClients = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text>EmptyClients</Text>
    </View>
  )
}

export default EmptyClients

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  }
})