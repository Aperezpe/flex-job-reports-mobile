import { Redirect } from "expo-router";

export default function Landing() {
  console.log('Landing')

  return <Redirect href="/(auth)/(drawer)/clients/" />;
}