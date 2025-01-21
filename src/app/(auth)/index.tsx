import { Redirect } from "expo-router";
import { useCompanyAndUser } from "../../context/CompanyAndUserContext";
import LoadingComponent from "../../components/LoadingComponent";

export default function Landing() {
  const { loading } = useCompanyAndUser()
  
  if (loading) return <LoadingComponent />
  
  return <Redirect href="/(auth)/(drawer)/clients/" />;
}