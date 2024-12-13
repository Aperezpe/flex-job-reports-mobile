import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { globalStyles } from '../../../../../constants/GlobalStyles'

type Props = {}

const ClientDetails = (props: Props) => {

  
  return (
    <View style={styles.container}>
      <Text style={[globalStyles.textTitle]}>{}</Text>
    </View>
  )
}

export default ClientDetails

const styles = StyleSheet.create({
  container: {
    padding: 15
  }
})