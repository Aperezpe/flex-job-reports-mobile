import { render } from "@testing-library/react-native";
import LoginRegisterLayout from "../../../app/(public)/_layout";
import * as SupabaseAuthContext from "../../../context/SupabaseAuth.ctx";

const setMockState = (state: Partial<typeof SupabaseAuthContext.defaultSupabaseAuthState>) => {
  (SupabaseAuthContext.useSupabaseAuth as jest.Mock).mockReturnValue({
    ...SupabaseAuthContext.defaultSupabaseAuthState,
    ...state,
  });
};

describe("<LoginRegisterLayout />", () => {

  beforeEach(() => {
    setMockState(SupabaseAuthContext.defaultSupabaseAuthState);
  });

  test("If auth operation is loading, ActivityIndicator shows", () => {
    // Arrange
    setMockState({ isLoading: true });

    // Act
    const { getByTestId } = render(<LoginRegisterLayout />);

    // Assert
    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeTruthy();
  });

});
