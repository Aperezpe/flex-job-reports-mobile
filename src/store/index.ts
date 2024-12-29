import { configureStore } from '@reduxjs/toolkit';
import appUserReducer from './slices/appUser.slice';
import appCompanyReducer from './slices/appCompany.slice';

export const store = configureStore({
  reducer: {
    appUserState: appUserReducer,
    appCompanyState: appCompanyReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;