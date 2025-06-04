import { createReducer } from "@reduxjs/toolkit";
import { JoinRequest } from "../../types/JoinRequest";
import {
  acceptJoinRequest,
  acceptJoinRequestFailure,
  acceptJoinRequestSuccess,
  deleteUserJoinRequest,
  deleteUserJoinRequestFailure,
  deleteUserJoinRequestSuccess,
  fetchCompanyJoinRequests,
  fetchCompanyJoinRequestsFailure,
  fetchCompanyJoinRequestsSuccess,
  fetchUserJoinRequest,
  fetchUserJoinRequestFailure,
  fetchUserJoinRequestSuccess,
  rejectJoinRequest,
  rejectJoinRequestFailure,
  rejectJoinRequestSuccess,
  sendJoinCompanyRequest,
  sendJoinCompanyRequestFailure,
  sendJoinCompanyRequestSuccess,
} from "../actions/joinRequestActions";
import { Alert } from "react-native";

interface JoinRequestState {
  userJoinRequest: JoinRequest | null;
  userJoinRequestLoading: boolean;
  userJoinRequestError: unknown | string | null;
  companyJoinRequests: JoinRequest[];
  companyJoinRequestsLoading: boolean;
  companyJoinRequestsError: unknown | string | null;
}

const initialState: JoinRequestState = {
  userJoinRequest: null,
  userJoinRequestLoading: false,
  userJoinRequestError: null,
  companyJoinRequests: [],
  companyJoinRequestsLoading: false,
  companyJoinRequestsError: null,
};

const joinRequestReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchUserJoinRequest, (state) => {
      state.userJoinRequestLoading = true;
      state.userJoinRequestError = null;
    })
    .addCase(fetchUserJoinRequestSuccess, (state, action) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequest = action.payload;
    })
    .addCase(fetchUserJoinRequestFailure, (state, action) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequestError = action.payload;
    })
    .addCase(deleteUserJoinRequest, (state) => {
      state.userJoinRequestLoading = true;
      state.userJoinRequestError = null;
    })
    .addCase(deleteUserJoinRequestSuccess, (state) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequest = null;
    })
    .addCase(deleteUserJoinRequestFailure, (state, action) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequestError = action.payload;
    })
    .addCase(sendJoinCompanyRequest, (state) => {
      state.userJoinRequestLoading = true;
      state.userJoinRequestError = null;
    })
    .addCase(sendJoinCompanyRequestSuccess, (state, action) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequest = action.payload;

      Alert.alert(
        "✅ Success!",
        `We've sent your request to join the company. You will be notified once your request is processed.`
      );
    })
    .addCase(sendJoinCompanyRequestFailure, (state, action) => {
      state.userJoinRequestLoading = false;
      state.userJoinRequestError = action.payload;
    })
    .addCase(fetchCompanyJoinRequests, (state) => {
      state.companyJoinRequestsLoading = true;
      state.companyJoinRequestsError = null;
    })
    .addCase(fetchCompanyJoinRequestsSuccess, (state, action) => {
      state.companyJoinRequestsLoading = false;
      state.companyJoinRequests = action.payload;
    })
    .addCase(fetchCompanyJoinRequestsFailure, (state, action) => {
      state.companyJoinRequestsLoading = false;
      state.companyJoinRequestsError = action.payload;
    })
    .addCase(acceptJoinRequest, (state) => {
      state.companyJoinRequestsLoading = true;
    })
    .addCase(acceptJoinRequestSuccess, (state, action) => {
      state.companyJoinRequestsLoading = false;
      // update the join request returned
      const updatedJoinRequest = action.payload;
      if (!updatedJoinRequest) return;
      // delete the join request from the list
      state.companyJoinRequests = state.companyJoinRequests.filter(
        (joinRequest) => joinRequest.userId !== updatedJoinRequest.userId
      );
    })
    .addCase(acceptJoinRequestFailure, (state, action) => {
      state.companyJoinRequestsLoading = false;
      state.companyJoinRequestsError = action.payload;
    })
    .addCase(rejectJoinRequest, (state) => {
      state.companyJoinRequestsLoading = true;
    })
    .addCase(rejectJoinRequestSuccess, (state, action) => {
      state.companyJoinRequestsLoading = false;
      // update the join request returned
      const updatedJoinRequest = action.payload;
      if (!updatedJoinRequest) return;
      // delete the join request from the list
      state.companyJoinRequests = state.companyJoinRequests.filter(
        (joinRequest) => joinRequest.userId !== updatedJoinRequest.userId
      );
    })
    .addCase(rejectJoinRequestFailure, (state, action) => {
      state.companyJoinRequestsLoading = false;
      state.companyJoinRequestsError = action.payload;
    });
});

export default joinRequestReducer;
