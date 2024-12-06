import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppUser } from '../../types/Auth/AppUser';

interface AppUserState {
  appUser: AppUser | null;
}

const initialState: AppUserState = {
  appUser: null,
};

const appUserSlice = createSlice({
  name: 'appUserState',
  initialState,
  reducers: {
    setAppUser: (state, action: PayloadAction<AppUser>) => {
      state.appUser = action.payload;
    }
  },
});

export const { setAppUser } = appUserSlice.actions;
export default appUserSlice.reducer;