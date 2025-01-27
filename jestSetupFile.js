jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(
    () => require("./__mocks__/supabase").mockSupabaseClient
  ),
}));

jest.mock("./src/context/SupabaseAuthContext", () => ({
  useSupabaseAuth: jest.fn(),
  SupabaseAuthProvider: jest.fn()
}));

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