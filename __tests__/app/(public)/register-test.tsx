import { fireEvent, renderRouter, waitFor } from "expo-router/testing-library";
import { AppColors } from "../../../src/constants/AppColors";
import Register from "../../../src/app/(public)/register";
import { StyleSheet } from "react-native";
import { GetByQuery } from "@testing-library/react-native/build/queries/make-queries";
import { TextMatch, TextMatchOptions } from "@testing-library/react-native/build/matches";
import { CommonQueryOptions } from "@testing-library/react-native/build/queries/options";
import { setSupabaseAuthMockState } from "../../../config/tests/setSupabaseAuthMockState";

describe("<Register />", () => {
  let mockSignUp: jest.Mock;

  const checkCheckbox = (getByTestId: GetByQuery<TextMatch, CommonQueryOptions & TextMatchOptions>) => {
    const checkbox = getByTestId("terms-and-conditions-checkbox");
    fireEvent.press(checkbox);
  }

  beforeAll(() => {
    mockSignUp = jest
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null });

    setSupabaseAuthMockState({
      session: null,
      signUp: mockSignUp,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  test("If in register screen, it shows Register text", () => {
    // Arrange
    const { getByText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );

    // Act
    const registerText = getByText("Register");

    // Assert
    expect(registerText).toBeTruthy();
  });

  test("If in register screen, it shows company Id field", () => {
    // Arrange
    const { getByPlaceholderText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );

    // Act
    const companyIDPlaceholder = getByPlaceholderText("Company ID*");

    // Assert
    expect(companyIDPlaceholder).toBeTruthy();
  });

  test("If in register screen, the technician tab is selected by default", () => {
    // Arrange
    const { getByText, debug } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );

    // Act
    const technicianText = getByText("Technician");
    const technicianTab = technicianText.parent.parent;
    const tabStyles = StyleSheet.flatten(technicianTab.props.style);

    // Assert
    expect(tabStyles.backgroundColor).toBe(AppColors.bluePrimary);
  });

  test("When checkbox is not checked, user can NOT hit submit", async () => {
    // Arrange
    const { getByText, queryByText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const submitButton = getByText("Register").parent.parent;

    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = queryByText("Required");
      expect(inlineError).toBeNull();
    })
  });

  test("When checkbox is checked, user can hit submit", async () => {
    // Arrange
    const { getByText, queryByText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const submitButton = getByText("Register").parent.parent;
    checkCheckbox(getByTestId);
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = queryByText("Required");
      expect(inlineError).not.toBeNull();
    })
  });

  test("When form is NOT submitted, no inline errors are shown", () => {
    const { queryByText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );

    const inlineError = queryByText("Invalid");

    expect(inlineError).not.toBeTruthy();
  });

  test("When company ID contains special character on validation, it shows 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "abc*");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });

  test("When company ID input contains a space on validation, it shows 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "abc abc");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });

  test("When company ID input contains an uppercase on validation, it shows 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID can only contain lowercase letters, numbers, dashes, and underscores.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "abc Abc");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });

  test("When company ID input is blank on validation, it shows 'Company ID is required.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID is required.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });

  test("When company ID input is less than 6 characters on validation, it shows 'Company ID must be at least 6 characters.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID must be at least 6 characters.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "acdfs");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });

  test("When company ID input is more than 30 characters on validation, it shows 'Company ID must be at most 30 characters.'", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID must be at most 30 characters.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "acdfsjdghdjhdfjkdjfkndskjvnasjkdnjfndjbndhfbdjnajlsndfjkndsju");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = getByText(errorMsg);
      expect(inlineError).not.toBeNull();
    });
  });
  
  test("Trailing or leading spaces are ignored on company ID validation", async () => {
    const { getByText, getByPlaceholderText, getByTestId, queryByText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );
    const errorMsg = 'Company ID must be at most 30 characters.';
    const companyIdInput = getByPlaceholderText("Company ID*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, "    some_user    ");
    fireEvent.press(submitButton);

    await waitFor(() => {
      const inlineError = queryByText(errorMsg);
      expect(inlineError).toBeNull();
    });
  });

  test("When form is invalid, signIn function is not called", async () => {
    const { getByText, getByPlaceholderText } = renderRouter(
      {
        "/register": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/register",
      }
    );

    const emailInput = getByPlaceholderText("Email*");
    const submitButton = getByText("Register");

    fireEvent.changeText(emailInput, "a@");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(0);
    });
  });

  test("When valid form is submitted, form gets submitted", async () => {
    const { getByText, getByPlaceholderText, getByTestId, debug } = renderRouter(
      {
        "/login": jest.fn(() => <Register />),
      },
      {
        initialUrl: "/login",
      }
    );

    const companyIdInput = getByPlaceholderText("Company ID*");
    const fullNameInput = getByPlaceholderText("Full Name*");
    const emailInput = getByPlaceholderText("Email*");
    const passwordInput = getByPlaceholderText("Password*");
    const retypePassword = getByPlaceholderText("Re-Type Password*");
    const submitButton = getByText("Register");
    checkCheckbox(getByTestId);

    fireEvent.changeText(companyIdInput, 'some_company');
    fireEvent.changeText(fullNameInput, "Abraham Perez");
    fireEvent.changeText(emailInput, "a@a.com");
    fireEvent.changeText(passwordInput, "a1s2d3f*!");
    fireEvent.changeText(retypePassword, "a1s2d3f*!");

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });
  });
});
