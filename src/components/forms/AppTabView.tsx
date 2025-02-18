import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TabViewProps } from '@rneui/base'

type Props = {} & TabViewProps;

const AppTabView = (props: Props) => {
  return (
    <View>
      <Text>AppTabView</Text>
    </View>
  )
}

export default AppTabView

const styles = StyleSheet.create({})