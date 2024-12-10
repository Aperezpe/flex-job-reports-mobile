import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { AuthScreenProvider } from "../../context/AuthScreen.ctx";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../../store";

type Props = {};

const AuthLayout = (props: Props) => {
  return (
    <Provider store={store}>
      <Stack>
        
      </Stack>
    </Provider>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({});
