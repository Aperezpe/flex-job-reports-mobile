import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppUser } from '../types/Auth/AppUser';

interface AppUserState {
  appUser: AppUser | null;
  insertingUser: boolean;
}

const initialState: AppUserState = {
  appUser: null,
  insertingUser: false,
};

const appUserSlice = createSlice({
  name: 'appUserState',
  initialState,
  reducers: {
    setAppUser: (state, action: PayloadAction<AppUser>) => {
      state.appUser = action.payload;
    },
    setInsertingUser: (state, action: PayloadAction<boolean>) => {
      state.insertingUser = action.payload;
    }
  },
});

export const { setAppUser, setInsertingUser } = appUserSlice.actions;
export default appUserSlice.reducer;