import { render } from "@testing-library/react-native";
import Footer from "../../../components/login/Footer";
import { usePathname } from "expo-router";

describe("<Footer />", () => {

  test("If in login screen, it shows 'Don't have an account yet?'", () => {
    // Arrange
    // setMockState({ inLoginPage: true })
    (usePathname as jest.Mock).mockReturnValue('/login');

    // Act
    const { getByText } = render(<Footer />);

    // Assert
    const dontHaveAccountYet = getByText("Don't have an account yet?");
    expect(dontHaveAccountYet).toBeTruthy();
  });

  // test("If in sign up screen, it shows 'Already have an account?'", () => {
  //   // Arrange
  //   setMockState({ inLoginPage: false })

  //   // Act
  //   const { getByText } = render(<Footer />);

  //   // Assert
  //   const alreadyHaveAccount = getByText("Already have an account?");
  //   expect(alreadyHaveAccount).toBeTruthy();
  // });

  // test("If clicked on Sign Up Link, it goes to register page", () => {
  //   // Arrange
  //   setMockState({ inLoginPage: true })

  //   // Arrange
  //   const { getByText } = render(<Footer />);

  //   // Act
  //   const signUpLink = getByText("Sign Up");

  //   // Assert the 'href' or 'to' property
  //   expect(signUpLink.props.href).toBe('register'); // Or check the 'to' prop if you're using React Router
  // });

  // test("If clicked on Login Link, it goes to login page", () => {
  //   // Arrange
  //   setMockState({ inLoginPage: false })

  //   // Arrange
  //   const { getByText } = render(<Footer />);

  //   // Act
  //   const signUpLink = getByText("Login");

  //   // Assert the 'href' or 'to' property
  //   expect(signUpLink.props.href).toBe('login'); // Or check the 'to' prop if you're using React Router
  // });

});
