import { render, waitFor } from "@testing-library/react-native";
import LoginRegisterLayout from "../../../app/(public)/_layout";
import * as SupabaseAuthContext from "../../../context/SupabaseAuth.ctx";
import RootLayout from "../../../app/_layout";
import { renderRouter, screen } from "expo-router/testing-library";
import Login from "../../../app/(public)/login";
import Register from "../../../app/(public)/register";
import Clients from "../../../app/(auth)/(drawer)/(stack)/clients";
import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import appCompanyReducer from "../../../store/slices/appCompany.slice";
import appUserReducer from "../../../store/slices/appUser.slice";
import { Provider } from "react-redux";
import AppLayout from "../../../app/(auth)/_layout";
import Landing from "../../../app/(auth)";
import DrawerLayout from "../../../app/(auth)/(drawer)/_layout";
import StackLayout from "../../../app/(auth)/(drawer)/(stack)/_layout";
import { View } from "react-native";
import ClientDetails from "../../../app/(auth)/(drawer)/(stack)/clients/[id]";
import { setSupabaseAuthMockState } from "../../../config/tests/setSupabaseAuthMockState";

const mockStore = configureStore<RootState>({
  reducer: {
    appUserState: appUserReducer,
    appCompanyState: appCompanyReducer,
  },
  preloadedState: {
    appUserState: { appUser: null },
    appCompanyState: { appCompany: null },
  },
});

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
        wrapper: ({ children }) => (
          <Provider store={mockStore}>
            {children}
          </Provider>
        ), // Provide Redux store
      }
    );

    // Assert
    await waitFor(() => expect(getPathname()).toBe('/clients'));
  });
});
