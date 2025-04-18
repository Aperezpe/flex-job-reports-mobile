import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  hideSystemType,
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
  upsertSystemType,
  upsertSystemTypeFailure,
  upsertSystemTypeSuccess,
  hideSystemTypeSuccess,
  hideSystemTypeFailure,
  leaveCompany,
  leaveCompanySuccess,
  leaveCompanyFailure,
} from "../actions/sessionDataActions";
import { mapAppUserSQLToAppUser } from "../../types/Auth/AppUser";
import { Company, mapCompanySQLToCompany } from "../../types/Company";
import {
  fetchCompanyAndUserApi,
  hideSystemTypeApi,
  leaveCompanyApi,
  upsertSystemTypeApi,
} from "../../api/sessionDataApi";
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { mapSystemType } from "../../types/SystemType";

function* fetchCompanyAndUserSaga(
  action: ReturnType<typeof fetchCompanyAndUser>
) {
  try {
    const { data, error } = yield call(fetchCompanyAndUserApi, action.payload);

    if (error) throw error;

    const user = mapAppUserSQLToAppUser(data);
    const company = mapCompanySQLToCompany(data?.companies);

    yield put(
      fetchCompanyAndUserSuccess({
        company,
        user,
        systemTypes: company.systemTypes ?? [],
      })
    );
  } catch (error) {
    yield put(fetchCompanyAndUserFailure((error as Error).message));
  }
}

function* upsertSystemTypesSaga(action: ReturnType<typeof upsertSystemType>) {
  const { appCompany }: { appCompany: Company | null } = yield select(
    selectAppCompanyAndUser
  );
  try {
    const { values, systemTypeId } = action.payload;

    if (!appCompany?.id)
      throw Error(
        "Company not available, if this error persists, contact support!"
      );

    const { data, error } = yield call(
      upsertSystemTypeApi,
      values,
      appCompany.id,
      systemTypeId
    );

    if (error) throw error;

    const systemType = mapSystemType(data);

    yield put(upsertSystemTypeSuccess(systemType));
  } catch (error) {
    yield put(upsertSystemTypeFailure((error as Error).message));
  }
}

function* hideSystemTypesSaga(action: ReturnType<typeof hideSystemType>) {
  try {
    const systemTypeId = action.payload;

    const { error } = yield call(hideSystemTypeApi, systemTypeId);

    if (error) throw error;

    yield put(hideSystemTypeSuccess(systemTypeId));
  } catch (error) {
    yield put(hideSystemTypeFailure((error as Error).message));
  }
}

function*  leaveCompanySaga(action: ReturnType<typeof leaveCompany>) {
  try {
    const userId = action.payload;

    const { data, error } = yield call(leaveCompanyApi, userId);

    if (error) throw error;

    const updatedUser = mapAppUserSQLToAppUser(data);
    yield put(leaveCompanySuccess(updatedUser));
  } catch (error) {
    yield put(leaveCompanyFailure((error as Error).message));
  }
}

export default function* sessionDataSaga() {
  yield takeLatest(fetchCompanyAndUser.type, fetchCompanyAndUserSaga);
  yield takeLatest(upsertSystemType.type, upsertSystemTypesSaga);
  yield takeLatest(hideSystemType.type, hideSystemTypesSaga);
  yield takeLatest(leaveCompany.type, leaveCompanySaga);
}
