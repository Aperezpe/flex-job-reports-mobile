import { createAction } from '@reduxjs/toolkit';
import { Company } from '../../types/Company';
import { AppUser } from '../../types/Auth/AppUser';

export const fetchCompanyAndUser = createAction<string>('FETCH_COMPANY_AND_USER');
export const fetchCompanyAndUserSuccess = createAction<{ company: Company; user: AppUser }>('FETCH_COMPANY_AND_USER_SUCCESS');
export const fetchCompanyAndUserFailure = createAction<string>('FETCH_COMPANY_AND_USER_FAILURE');
export const clearCompanyAndUser = createAction('CLEAR_COMPANY_AND_USER');
export const setLoadingCompanyAndUser = createAction<boolean>('SET_LOADING_COMPANY_AND_USER');