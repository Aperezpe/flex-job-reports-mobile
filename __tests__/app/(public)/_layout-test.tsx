import { render, waitFor } from "@testing-library/react-native";
import LoginRegisterLayout from "../../../src/app/(public)/_layout";
import * as SupabaseAuthContext from "../../../src/context/SupabaseAuthContext";
import RootLayout from "../../../src/app/_layout";
import { renderRouter, screen } from "expo-router/testing-library";
import Login from "../../../src/app/(public)/login";
import Register from "../../../src/app/(public)/register";
import Clients from "../../../src/app/(auth)/(drawer)/(stack)/clients";
import AppLayout from "../../../src/app/(auth)/_layout";
import Landing from "../../../src/app/(auth)";
import DrawerLayout from "../../../src/app/(auth)/(drawer)/_layout";
import StackLayout from "../../../src/app/(auth)/(drawer)/(stack)/_layout";
import { View } from "react-native";
import ClientDetails from "../../../src/app/(auth)/(drawer)/(stack)/clients/[id]";
import { setSupabaseAuthMockState } from "../../../src/config/tests/setSupabaseAuthMockState";

describe("<LoginRegisterLayout />", () => {
  beforeEach(() => {
    setSupabaseAuthMockState(SupabaseAuthContext.defaultSupabaseAuthState);
  });

  afterAll(() => {
    setSupabaseAuthMockState(SupabaseAuthContext.defaultSupabaseAuthState)
  })

  test("If auth operation is loading, ActivityIndicator shows", () => {
    // Arrange
    setSupabaseAuthMockState({ isLoading: true });

    // Act
    const { getByTestId } = render(<LoginRegisterLayout />);

    // Assert
    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeTruthy();
  });

  test("If auth operation NOT loading and session is null, it shows login page", () => {
    // Arrange
    setSupabaseAuthMockState({ isLoading: false, session: null });

    // Act
    renderRouter(
      {
        index: jest.fn(() => <RootLayout />),
        "/login": jest.fn(),
        "/register": jest.fn(),
        "/clients": jest.fn(),
      },
      {
        initialUrl: "/",
      }
    );

    // Assert
    expect(screen).toHavePathname("/");
  });

  test("If auth operation NOT loading and session is NOT null, direct to clients", async () => {
    // Arrange
    setSupabaseAuthMockState({
      isLoading: false,
      session: {
        user: {
          id: "1",
          app_metadata: {},
          aud: "",
          user_metadata: {},
          created_at: "",
        },
        access_token: "",
        refresh_token: "",
        expires_in: 0,
        token_type: "",
      },
    });

    // Act
    const { getPathname } = renderRouter(
      {
        // Define routes for your app based on your file structure
        index: { default: () => <RootLayout /> }, // The RootLayout for your main layout
        "(public)/_layout": { default: () => <LoginRegisterLayout /> }, // Layout for public pages
        "(public)/login": { default: () => <Login /> }, // Login screen
        "(public)/register": { default: () => <Register /> }, // Register screen
        "(auth)/_layout": { default: () => <AppLayout /> }, // Auth layout with redirects
        "(auth)/index": { default: () => <Landing /> }, // Auth index for redirects
        "(auth)/(drawer)/_layout": { default: () => <DrawerLayout /> }, // Drawer navigation setup
        "(auth)/(drawer)/forms": { default: () =>  <View />}, // Stack navigation setup
        "(auth)/(drawer)/settings": { default: () =>  <View />}, // Stack navigation setup
        "(auth)/(drawer)/technicians": { default: () =>  <View />}, // Stack navigation setup
        "(auth)/(drawer)/(stack)/_layout": { default: () => <StackLayout /> }, // Stack navigation setup
        "(auth)/(drawer)/(stack)/clients/index": { default: () => <Clients /> }, // Clients screen
        "(auth)/(drawer)/(stack)/clients/[id]": { default: () => <ClientDetails /> }, // Clients screen
        "(auth)/(drawer)/(stack)/clients/add-client": { default: () => <View /> }, // Clients screen
      },
      {
        initialUrl: "/(auth)/",
      }
    );

    // Assert
    await waitFor(() => expect(getPathname()).toBe('/clients'));
  });
});
