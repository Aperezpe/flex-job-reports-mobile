import { StyleSheet } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'

type Props = {}

const BackButton = (props: Props) => {
  return (
    <Feather name="chevron-left" size={28} />
  )
}

export default BackButton

const styles = StyleSheet.create({})