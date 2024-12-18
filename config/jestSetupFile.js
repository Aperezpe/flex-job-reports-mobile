jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => require('../__mocks__/supabase').mockSupabaseClient),
}));

jest.mock("../context/SupabaseAuth.ctx", () => ({
  useSupabaseAuth: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn(), // Mock usePath
}));