import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AppColors } from '../constants/AppColors'
import { TouchableOpacityProps } from 'react-native-gesture-handler'

type Props = {} & TouchableOpacityProps;

const OptionsButton = ({ onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialCommunityIcons name='dots-horizontal-circle-outline' color={AppColors.bluePrimary} size={24} />
    </TouchableOpacity>
  )
}

export default OptionsButton

const styles = StyleSheet.create({})