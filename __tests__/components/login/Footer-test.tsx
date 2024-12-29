import Footer from "../../../src/components/login/Footer";
import { renderRouter } from "expo-router/testing-library";

describe("<Footer />", () => {
  test("If in login screen, it shows 'Don't have an account yet?'", () => {
    // Arrange
    const { getByText } = renderRouter(
      {
        '/login': jest.fn(() => <Footer />),
      },
      {
        initialUrl: "/login",
      }
    );

    // Act
    const dontHaveAccountYet = getByText("Don't have an account yet?")

    // Assert
    expect(dontHaveAccountYet).toBeTruthy();
  });

  test("If in login screen, it shows 'Don't have an account yet?'", () => {
    // Arrange
    const { getByText } = renderRouter(
      {
        '/register': jest.fn(() => <Footer />),
      },
      {
        initialUrl: "/register",
      }
    );

    // Act
    const alreadyHaveAnAccount = getByText("Already have an account?")

    // Assert
    expect(alreadyHaveAnAccount).toBeTruthy();
  });

});
