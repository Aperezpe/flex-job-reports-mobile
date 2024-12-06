import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../types/Company';

interface CompanyState {
  appCompany: Company | null;
}

const initialState: CompanyState = {
  appCompany: null,
};

const AppCompanySlice = createSlice({
  name: 'appCompanyState',
  initialState,
  reducers: {
    setAppCompany: (state, action: PayloadAction<Company>) => {
      state.appCompany = action.payload;
    },
  },
});

export const { setAppCompany } = AppCompanySlice.actions;
export default AppCompanySlice.reducer;