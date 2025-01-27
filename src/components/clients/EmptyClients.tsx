import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const EmptyClients = () => {
  return (
    <View style={styles.container}>
      <Text>EmptyClients</Text>
    </View>
  )
}

export default EmptyClients

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})