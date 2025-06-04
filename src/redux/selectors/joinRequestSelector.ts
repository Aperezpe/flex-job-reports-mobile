import { createSelector } from "reselect";
import { RootState } from "../store";
import { PGRST116 } from "../../constants/ErrorCodes";

export const selectUserJoinRequest = createSelector(
  (state: RootState) => state.joinRequests.userJoinRequest,
  (state: RootState) => state.joinRequests.userJoinRequestLoading,
  (state: RootState) => state.joinRequests.userJoinRequestError,
  (userJoinRequest, userJoinRequestLoading, userJoinRequestError) => {

    const joinRequestFound = userJoinRequest !== null;

    // If the join request is not found or the database returns an empty response error,
    // it indicates the user has no pending join requests.
    // const isNoCompanyUser =
    //   (!joinRequestFound && !userJoinRequestLoading) ||
    //   (userJoinRequestError && userJoinRequestError.code !== PGRST116);

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
