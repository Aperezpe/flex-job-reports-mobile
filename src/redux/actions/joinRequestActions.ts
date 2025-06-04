import { createAction } from "@reduxjs/toolkit";
import { JoinRequest } from "../../types/JoinRequest";
import { JoinCompanyForm } from "../../types/Company";

export const fetchUserJoinRequest = createAction<string>(
  "FETCH_USER_JOIN_REQUEST"
);
export const fetchUserJoinRequestSuccess = createAction<JoinRequest>(
  "FETCH_USER_JOIN_REQUEST_SUCCESS"
);
export const fetchUserJoinRequestFailure = createAction<unknown>(
  "FETCH_USER_JOIN_REQUEST_FAILURE"
);

export const deleteUserJoinRequest = createAction<{ userId: string, token: string }>(
  "DELETE_USER_JOIN_REQUEST"
);
export const deleteUserJoinRequestSuccess = createAction(
  "DELETE_USER_JOIN_REQUEST_SUCCESS"
);
export const deleteUserJoinRequestFailure = createAction<string>(
  "DELETE_USER_JOIN_REQUEST_FAILURE"
);

export const sendJoinCompanyRequest = createAction<JoinCompanyForm>(
  "SEND_COMPANY_JOIN_REQUEST"
);
export const sendJoinCompanyRequestSuccess = createAction<JoinRequest>(
  "SEND_COMPANY_JOIN_REQUEST_SUCCESS"
);
export const sendJoinCompanyRequestFailure = createAction<string>(
  "SEND_COMPANY_JOIN_REQUEST_FAILURE"
);

export const fetchCompanyJoinRequests = createAction("FETCH_COMPANY_JOIN_REQUESTS");
export const fetchCompanyJoinRequestsSuccess = createAction<JoinRequest[]>(
  "FETCH_COMPANY_JOIN_REQUESTS_SUCCESS"
);
export const fetchCompanyJoinRequestsFailure = createAction<string>(
  "FETCH_COMPANY_JOIN_REQUESTS_FAILURE"
);

export const acceptJoinRequest = createAction<{ technicianId: string, token: string }>('ACCEPT_JOIN_REQUEST');
export const acceptJoinRequestSuccess = createAction<JoinRequest | null>('ACCEPT_JOIN_REQUEST_SUCCESS');
export const acceptJoinRequestFailure = createAction<string>('ACCEPT_JOIN_REQUEST_FAILURE');

export const rejectJoinRequest = createAction<string | undefined>('REJECT_JOIN_REQUEST');
export const rejectJoinRequestSuccess = createAction<JoinRequest | null>('REJECT_JOIN_REQUEST_SUCCESS');
export const rejectJoinRequestFailure = createAction<string>('REJECT_JOIN_REQUEST_FAILURE');