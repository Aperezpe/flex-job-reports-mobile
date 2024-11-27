import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { AppColors } from '../../../constants/AppColors';
import { globalStyles } from '../../../constants/GlobalStyles';

type RegisterFormProps = {};

export default function RegisterFormView(props: RegisterFormProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const selectedColor = AppColors.bluePrimary;

  return (
    <View style={styles.container}>
      <View style={styles.tabGroup}>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor:
              selectedTab === 0 ? selectedColor : AppColors.transparent,
          }}
          onPress={() => setSelectedTab(0)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              selectedTab === 0 ? styles.tabTextSelected : null,
            ]}
          >
            Technician
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...styles.tabContainer,
            backgroundColor:
              selectedTab === 1 ? selectedColor : AppColors.transparent,
          }}
          onPress={() => setSelectedTab(1)}
        >
          <Text
            style={[
              globalStyles.textRegular,
              styles.tabText,
              selectedTab === 1 ? styles.tabTextSelected : null,
            ]}
          >
            Company Admin
          </Text>
        </TouchableOpacity>
      </View>
      <Text>Technician form</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {

  },
  tabGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 12,
    backgroundColor: AppColors.lightGraySecondary,
  },
  tabContainer: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  tabText: {
    textAlign: 'center',
  },
  tabTextSelected: {
    fontFamily: 'HindVadodara_700Bold',
    color: AppColors.lightGrayPrimary,
  },
});
