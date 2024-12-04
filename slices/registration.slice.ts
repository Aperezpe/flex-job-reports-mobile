import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RegistrationState {
  insertingAuthData: boolean;
}

const initialState: RegistrationState = {
  insertingAuthData: false,
};

const registrationSlice = createSlice({
  name: 'registrationState',
  initialState,
  reducers: {
    setInsertingAuthData: (state, action: PayloadAction<boolean>) => {
      state.insertingAuthData = action.payload;
    },
  },
});

export const { setInsertingAuthData } = registrationSlice.actions;
export default registrationSlice.reducer;