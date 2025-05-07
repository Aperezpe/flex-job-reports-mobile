import { call, put, select, takeLatest } from "redux-saga/effects";
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
import { JoinRequest, mapJoinRequest } from "../../types/JoinRequest";
import {
  acceptJoinRequestApi,
  deleteUserJoinRequestApi,
  fetchCompanyJoinRequestsApi,
  fetchUserJoinRequestApi,
  rejectJoinRequestApi,
  sendJoinCompanyRequestApi,
} from "../../api/joinRequestApi";
import { AppUser } from "../../types/Auth/AppUser";
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { Company } from "../../types/Company";

function* fetchUserJoinRequestSaga(
  action: ReturnType<typeof fetchUserJoinRequest>
) {
  try {
    const userId = action.payload;

    const { data, error } = yield call(fetchUserJoinRequestApi, userId);

    if (error) throw error;

    const joinRequest = mapJoinRequest(data);
    yield put(fetchUserJoinRequestSuccess(joinRequest));
  } catch (error) {
    yield put(fetchUserJoinRequestFailure(error));
  }
}

function* deleteUserJoinRequestSaga(
  action: ReturnType<typeof deleteUserJoinRequest>
) {
  try {
    const userId = action.payload;

    const { error } = yield call(deleteUserJoinRequestApi, userId);
    if (error) throw error;

    yield put(deleteUserJoinRequestSuccess());
  } catch (error) {
    yield put(deleteUserJoinRequestFailure((error as Error).message));
  }
}

function* sendJoinCompanyRequestSaga(
  action: ReturnType<typeof sendJoinCompanyRequest>
) {
  const { appUser }: { appUser: AppUser | null } = yield select(
    selectAppCompanyAndUser
  );

  try {
    if (!appUser?.id || !appUser?.fullName)
      throw Error(
        "User not available, if this error persists, contact support!"
      );

    const { companyUid } = action.payload;

    const { data, error } = yield call(
      sendJoinCompanyRequestApi,
      companyUid,
      appUser.id,
      appUser.fullName
    );

    if (error) throw error;

    const joinRequest = mapJoinRequest(data);
    yield put(sendJoinCompanyRequestSuccess(joinRequest));
  } catch (error) {
    yield put(sendJoinCompanyRequestFailure((error as Error).message));
  }
}

function* fetchCompanyJoinRequestsSaga() {
  const { appCompany }: { appCompany: Company | null } = yield select(
    selectAppCompanyAndUser
  );

  try {
    if (!appCompany?.companyUID)
      throw Error(
        "Company not available, if this error persists, contact support!"
      );

    const { data, error } = yield call(
      fetchCompanyJoinRequestsApi,
      appCompany.companyUID
    );

    if (error && error.code === "PGRST116") {
      yield put(fetchCompanyJoinRequestsSuccess([]));
    } else if (error) {
      throw error;
    }

    const companyJoinRequests: JoinRequest[] = data.map(mapJoinRequest);
    yield put(fetchCompanyJoinRequestsSuccess(companyJoinRequests));
  } catch (error) {
    yield put(fetchCompanyJoinRequestsFailure((error as Error).message));
  }
}

function* acceptJoinRequestSaga(action: ReturnType<typeof acceptJoinRequest>) {
  try {
    const technicianId = action.payload;

    const { data, error } = yield call(
      acceptJoinRequestApi,
      technicianId
    );

    if (error?.code === "PGRST116") {
      yield put(acceptJoinRequestSuccess(null));
      return;
    } else

    if (error) throw error;

    const joinRequest: JoinRequest = mapJoinRequest(data);
    yield put(acceptJoinRequestSuccess(joinRequest));
  } catch (error) {
    yield put(acceptJoinRequestFailure((error as Error).message));
  }
}

function* rejectJoinRequestSaga(action: ReturnType<typeof rejectJoinRequest>) {
  try {
    const technicianId = action.payload;

    const { data, error } = yield call(
      rejectJoinRequestApi,
      technicianId
    );

    if (error?.code === "PGRST116") {
      yield put(rejectJoinRequestSuccess(null));
      return;
    } else if (error) throw error;

    const joinRequest: JoinRequest = mapJoinRequest(data);
    yield put(rejectJoinRequestSuccess(joinRequest));
  } catch (error) {
    yield put(rejectJoinRequestFailure((error as Error).message));
  }
}

export default function* joinRequestSaga() {
  yield takeLatest(fetchUserJoinRequest.type, fetchUserJoinRequestSaga);
  yield takeLatest(deleteUserJoinRequest.type, deleteUserJoinRequestSaga);
  yield takeLatest(sendJoinCompanyRequest.type, sendJoinCompanyRequestSaga);
  yield takeLatest(fetchCompanyJoinRequests.type, fetchCompanyJoinRequestsSaga);
  yield takeLatest(acceptJoinRequest.type, acceptJoinRequestSaga);
  yield takeLatest(rejectJoinRequest.type, rejectJoinRequestSaga);
}
