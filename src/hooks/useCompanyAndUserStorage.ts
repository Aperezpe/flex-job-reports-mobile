import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Company } from '../types/Company'; 
import { AppUser } from '../types/Auth/AppUser'; // Your types

const useCompanyAndUserStorage = () => {
  const [appCompany, setAppCompany] = useState<Company | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  // Get company and user from AsyncStorage
  const getCompanyAndUserFromStorage = async () => {
    try {
      const companyData = await AsyncStorage.getItem('appCompany');
      const userData = await AsyncStorage.getItem('appUser');

      if (companyData && userData) {
        setAppCompany(JSON.parse(companyData));
        setAppUser(JSON.parse(userData));
      } else {
        setAppCompany(null);
        setAppUser(null);
      }
    } catch (error) {
      console.error('Error getting data from AsyncStorage:', error);
    }
  };

  // Set company and user to AsyncStorage
  const setCompanyAndUserToStorage = async (company: Company, user: AppUser) => {
    try {
      await AsyncStorage.setItem('appCompany', JSON.stringify(company));
      await AsyncStorage.setItem('appUser', JSON.stringify(user));
      setAppCompany(company); // Update local state
      setAppUser(user); // Update local state
      console.log('Company and User saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  // Clear company and user from AsyncStorage
  const clearCompanyAndUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('appCompany');
      await AsyncStorage.removeItem('appUser');
      setAppCompany(null); // Reset state
      setAppUser(null); // Reset state
      console.log('Company and User cleared from AsyncStorage');
    } catch (error) {
      console.error('Error clearing data from AsyncStorage:', error);
    }
  };

  // Initialize the hook by fetching data on mount
  useEffect(() => {
    getCompanyAndUserFromStorage();
  }, []);

  return {
    appCompany,
    appUser,
    setCompanyAndUserToStorage,
    clearCompanyAndUserFromStorage,
  };
};

export default useCompanyAndUserStorage;
