import { Redirect } from "expo-router";
import React from 'react';

export default function Landing() {
  return <Redirect href="/(auth)/clients" />;
}