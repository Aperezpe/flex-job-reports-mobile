import {
  fireEvent,
  renderRouter,
  waitFor,
} from "expo-router/testing-library";
import Login from "../../../src/app/(public)/login";
import { AppColors } from "../../../src/constants/AppColors";
import { setSupabaseAuthMockState } from "../../../src/config/tests/setSupabaseAuthMockState";

describe("<Login />", () => {
  let mockSignIn: jest.Mock;

  beforeAll(() => {
    mockSignIn = jest
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null });

    setSupabaseAuthMockState({
      session: null,
      signIn: mockSignIn,
    });
  });

  test("If in login screen, it shows  Login text", () => {
    // Arrange
    const { getByText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    // Act
    const loginText = getByText("Login");

    // Assert
    expect(loginText).toBeTruthy();
  });

  test("If in login screen, it shows email and password fields only", () => {
    // Arrange
    const { getByPlaceholderText, queryByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    // Act
    const emailPlaceholder = getByPlaceholderText("Email*");
    const passwordPlaceholder = getByPlaceholderText("Password*");
    const companyId = queryByPlaceholderText("Company ID*");

    // Assert
    expect(emailPlaceholder).toBeTruthy();
    expect(passwordPlaceholder).toBeTruthy();
    expect(companyId).not.toBeTruthy();
  });

  test("When any field is focused, the border turns blue", () => {
    const { queryAllByTestId, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const inputContainers = queryAllByTestId("input-container");
    const emailInput = getByPlaceholderText("Email*");

    expect(inputContainers[0].props.style).not.toContainEqual({
      borderColor: AppColors.bluePrimary,
    });

    fireEvent.press(emailInput);

    expect(inputContainers[0].props.style).toContainEqual({
      borderColor: AppColors.bluePrimary,
    });
  });

  test("When form is NOT submitted, not inline errors are shown", () => {
    const { queryByText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const inlineError = queryByText("Invalid");

    expect(inlineError).not.toBeTruthy();
  });

  test("When form is submitted, and form is blank, shows inline error", async () => {
    const { getByText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const submitButton = getByText("Login");

    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText("Required");
      expect(inlineError).toBeTruthy();
    });
  });

  test("When email input has invalid email, it shows 'Invalid email' inline error", async () => {
    const { getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const emailInput = getByPlaceholderText("Email*");
    const submitButton = getByText("Login");

    fireEvent.changeText(emailInput, "abc");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText("Invalid email");
      expect(inlineError).toBeTruthy();
    });
  });

  test("When email input has valid email, it shows no email inline error is shown", async () => {
    const { queryByText, getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const emailInput = getByPlaceholderText("Email*");
    const submitButton = getByText("Login");

    fireEvent.changeText(emailInput, "some@email.com");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = queryByText("Invalid email");
      const inlineError2 = queryByText("Required");
      expect(inlineError).not.toBeTruthy();
      expect(inlineError2).not.toBeTruthy();
    });
  });

  test("When password input has blank password, it shows 'No Password Provided'", async () => {
    const { queryByText, getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const passwordInput = getByPlaceholderText("Password*");
    const submitButton = getByText("Login");

    fireEvent.changeText(passwordInput, "");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText("No password provided.");
      expect(inlineError).toBeTruthy();
    });
  });

  test("When password is less than 8 characters, it shows 'Password is too short - should be 8 chars minimum.'", async () => {
    const { queryByText, getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const passwordInput = getByPlaceholderText("Password*");
    const submitButton = getByText("Login");

    fireEvent.changeText(passwordInput, "a1s2d3f");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(
        "Password is too short - should be 8 chars minimum."
      );
      expect(inlineError).toBeTruthy();
    });
  });

  test("When password contains non-latin letters, it shows 'Password can only contain Latin letters.'", async () => {
    const { queryByText, getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const passwordInput = getByPlaceholderText("Password*");
    const submitButton = getByText("Login");

    fireEvent.changeText(passwordInput, "a1s2d3f*☺");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(
        "Password can only contain Latin letters, numbers, and common symbols."
      );
      expect(inlineError).toBeTruthy();
    });
  });

  test("When form is invalid, signIn function is not called", async () => {
    const { getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const emailInput = getByPlaceholderText("Email*");
    const submitButton = getByText("Login");

    fireEvent.changeText(emailInput, "a@");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(0);
    });
  });

  test("When valid form is submitted, no inline error is shown'", async () => {
    const { getByText, getByPlaceholderText } = renderRouter(
      {
        "/login": jest.fn(() => <Login />),
      },
      {
        initialUrl: "/login",
      }
    );

    const passwordInput = getByPlaceholderText("Password*");
    const emailInput = getByPlaceholderText("Email*");
    const submitButton = getByText("Login");

    fireEvent.changeText(passwordInput, "a1s2d3f*!");
    fireEvent.changeText(emailInput, "a@a.com");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });
});
