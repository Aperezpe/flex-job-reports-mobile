import { Redirect } from "expo-router";

export default function Landing() {
  return <Redirect href="/(auth)/(drawer)/" />;
}