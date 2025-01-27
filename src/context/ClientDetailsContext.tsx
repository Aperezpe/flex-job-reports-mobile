// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   Dispatch,
//   SetStateAction,
// } from "react";
// import { PostgrestError } from "@supabase/supabase-js";
// import { supabase } from "../config/supabase";
// import useAsyncLoading from "../hooks/useAsyncLoading";
// import { useCompanyAndUser } from "./CompanyAndUserContext";
// import {
//   ClientAndAddresses,
//   mapClientAndAddresses,
// } from "../types/ClientAndAddresses";
// import { AddClientFormValues, ClientSQL } from "../types/Client";
// import { AddAddressFormValues, AddressSQL } from "../types/Address";
// import _ from 'lodash';

// interface ClientDetailsContextType {
//   loading: boolean;
//   setLoading: Dispatch<SetStateAction<boolean>>;
//   error: PostgrestError | null;
//   fetchClientById: (clientId: string) => Promise<void>;
//   resetClient: () => void;
//   addAddress: (values: AddAddressFormValues) => Promise<void>;
//   client: ClientAndAddresses | null;
//   query: string;
//   setQuery: Dispatch<SetStateAction<string>>;
// }

// const ClientDetailsContext = createContext<ClientDetailsContextType | undefined>(undefined);

// export const ClientDetailsProvider = ({ children }: { children: ReactNode }) => {
//     const { appCompany } = useCompanyAndUser();
//   const { loading, callWithLoading, setLoading } = useAsyncLoading();
//   const [query, setQuery] = useState("");
//   const [error, setError] = useState<PostgrestError | null>(null);
//   const [client, setClient] = useState<ClientAndAddresses | null>(null);

//   // reset client to null function
//   const resetClient = () => setClient(null);

//   const fetchClientById = async (clientId: string): Promise<void> => {
//     callWithLoading(async () => {
//       try {
//         const { data, error } = await supabase
//           .from("clients")
//           .select("*, addresses(*)")
//           .eq("id", clientId)
//           .single();

//         if (error) throw error;

//         const client = mapClientAndAddresses(data);
//         setClient(client);
//       } catch (error) {
//         setError(error as PostgrestError);
//         console.log("Error while fetchClientById:", error);
//       }
//     });
//   };

//   // add Address to a client
//   const addAddress = async (values: AddAddressFormValues): Promise<void> => {
//     callWithLoading(async () => {
//       const { data, error } = await supabase
//         .from("addresses")
//         .insert<AddressSQL>([
//           {
//             client_id: client?.id?.toString(),
//             address_title: values.title,
//             address_street: values.street,
//             address_street2: values.street2,
//             address_city: values.city,
//             address_state: values.state,
//             address_zip_code: values.zipcode,
//           },
//         ])
//         .select("*");

//       if (error) throw error;

//       const newAddress = data as AddressSQL;
//       setClient((prevClient) => {
//         if (!prevClient) return null;
//         return {
//           ...prevClient,
//           addresses: [...(prevClient.addresses ?? []), newAddress],
//         };
//       });
//     });
//   };

//   return (
//     <ClientDetailsContext.Provider
//       value={{
//         loading,
//         error,
//         fetchClientById,
//         resetClient,
//         addAddress,
//         client,
//         setLoading,
//         setQuery,
//         query,
//       }}
//     >
//       {children}
//     </ClientDetailsContext.Provider>
//   );
// };

// export const useClientDetails = (): ClientDetailsContextType => {
//   const context = useContext(ClientDetailsContext);
//   if (!context) {
//     throw new Error("useClientDetails must be used within a ClientDetailsProvider");
//   }
//   return context;
// };
