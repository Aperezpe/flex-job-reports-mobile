import React, { Component, PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../../../constants/AppColors';

type InlineErrorTextProps = {
  showInlineError: boolean;
} & PropsWithChildren;

const InlineErrorText: React.FC<InlineErrorTextProps> = (props: InlineErrorTextProps) => {
  const { showInlineError, children } = props;
  return (
    <View>
      {showInlineError && <Text style={styles.text}>{children}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: AppColors.inlineErrorColor,
    fontFamily: 'HindVadodara-Medium',
    fontSize: 12
  }
})

export default InlineErrorText;
