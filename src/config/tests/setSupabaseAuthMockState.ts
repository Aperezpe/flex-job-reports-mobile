import * as SupabaseAuthContext from "../../context/SupabaseAuthContext";

export const setSupabaseAuthMockState = (
  state: Partial<typeof SupabaseAuthContext.defaultSupabaseAuthState>
) => {
  const newState = {
    ...SupabaseAuthContext.defaultSupabaseAuthState,
    ...state,
  };

  (SupabaseAuthContext.useSupabaseAuth as jest.Mock).mockReturnValue(newState);

  return newState;
};