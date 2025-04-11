import { View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { selectAppCompanyAndUser } from '../../../redux/selectors/sessionDataSelectors';
import { UserStatus } from '../../../types/Auth/AppUser';
import { Redirect } from 'expo-router';

const LandingScreen = () => {

  const { appUser } = useSelector(selectAppCompanyAndUser);
  const isAllowedUser = appUser?.status === UserStatus.ADMIN || appUser?.status === UserStatus.TECHNICIAN;
  const isPendingTechnician = appUser?.status === UserStatus.PENDING;

  if (isPendingTechnician) return <Redirect href='/(drawer)/pending-technician' />
  else if (isAllowedUser) return <Redirect href='/(drawer)/clients' />

  return <View />
  
}

export default LandingScreen