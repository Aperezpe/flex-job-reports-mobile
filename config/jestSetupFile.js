import { isLoaded } from "expo-font";
import { SupabaseAuthProvider } from "../context/SupabaseAuth.ctx";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(
    () => require("../__mocks__/supabase").mockSupabaseClient
  ),
}));

jest.mock("../context/SupabaseAuth.ctx", () => ({
  useSupabaseAuth: jest.fn(),
  SupabaseAuthProvider: jest.fn()
}));

// export const mockUsePathname = jest.fn();
// // Mock expo-router
// jest.mock("expo-router", () => {
//   const { TouchableOpacity, Text, View } = require('react-native')
//   return {
//     ...jest.requireActual('expo-router'),
//     usePathname: mockUsePathname,
//     Link: jest.fn(({ children, ...props }) => (
//       <TouchableOpacity {...props}>
//         <Text>{children}</Text>
//       </TouchableOpacity>
//     )),
//     Slot: jest.fn(() => null),
//     Redirect: jest.fn(() => null)
//   };
// });

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, false]), // Fonts are loaded
  isLoaded: jest.fn(() => true)
}));

jest.mock('expo-linking', () => {
  
  return {
    ...jest.requireActual('expo-linking'),
    createURL: jest.fn(),
  };

});