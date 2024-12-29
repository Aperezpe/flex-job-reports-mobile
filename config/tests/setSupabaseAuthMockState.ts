import * as SupabaseAuthContext from "../../src/context/SupabaseAuth.ctx";

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