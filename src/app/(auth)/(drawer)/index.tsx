import { View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { selectAppCompanyAndUser } from '../../../redux/selectors/sessionDataSelectors';
import { Redirect } from 'expo-router';

const LandingScreen = () => {

  const { isAllowedUser, isPendingTechnician, isNoCompanyUser } = useSelector(selectAppCompanyAndUser);

  if (isPendingTechnician || isNoCompanyUser) return <Redirect href='/(drawer)/user-lobby' />
  else if (isAllowedUser) return <Redirect href='/(drawer)/clients' />

  return <View />
  
}

export default LandingScreen