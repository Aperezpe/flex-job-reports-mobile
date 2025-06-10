import { createSelector } from "reselect";
import { RootState } from "../store";

export const selectUserJoinRequest = createSelector(
  (state: RootState) => state.joinRequests.userJoinRequest,
  (state: RootState) => state.joinRequests.userJoinRequestLoading,
  (state: RootState) => state.joinRequests.userJoinRequestError,
  (userJoinRequest, userJoinRequestLoading) => {

    const joinRequestFound = userJoinRequest !== null;

    const isPendingTechnician = joinRequestFound && !userJoinRequestLoading;

    return { userJoinRequest, isPendingTechnician };
  }
);
export const selectUserJoinRequestLoading = (state: RootState) =>
  state.joinRequests.userJoinRequestLoading;
export const selectUserJoinRequestError = (state: RootState) =>
  state.joinRequests.userJoinRequestError;

export const selectCompanyJoinRequests = (state: RootState) =>
  state.joinRequests.companyJoinRequests;
export const selectCompanyJoinRequestsLoading = (state: RootState) =>
  state.joinRequests.companyJoinRequestsLoading;
export const selectCompanyJoinRequestsError = (state: RootState) =>
  state.joinRequests.companyJoinRequestsError;
