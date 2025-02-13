import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  deleteSystemType,
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
  upsertSystemType,
  upsertSystemTypeFailure,
  upsertSystemTypeSuccess,
} from "../actions/sessionDataActions";
import { UserAndCompanySQL } from "../../types/Auth/SignUpCompanyAdmin";
import { mapUserSQLToAppUser } from "../../types/Auth/AppUser";
import { Company, mapCompanySQLToCompany } from "../../types/Company";
import { fetchCompanyAndUserApi, upsertSystemTypeApi } from "../../api/sessionDataApi";
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { mapSystemType } from "../../types/SystemType";

function* fetchCompanyAndUserSaga(
  action: ReturnType<typeof fetchCompanyAndUser>
) {
  try {
    const { data, error } = yield call(fetchCompanyAndUserApi, action.payload);

    if (error) throw error;

    const userWithCompany: UserAndCompanySQL = {
      ...data,
      company: data?.companies,
    };

    const user = {
      ...mapUserSQLToAppUser(userWithCompany),
      companyId: userWithCompany?.company?.id,
    };
    const company = mapCompanySQLToCompany(userWithCompany?.company);

    yield put(fetchCompanyAndUserSuccess({ company, user }));
  } catch (error) {
    yield put(fetchCompanyAndUserFailure((error as Error).message));
  }
}


function* upsertSystemTypesSaga(
  action: ReturnType<typeof upsertSystemType>
) {
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

function* deleteSystemTypesSaga() {
  
}


export default function* sessionDataSaga() {
  yield takeLatest(fetchCompanyAndUser.type, fetchCompanyAndUserSaga);
  yield takeLatest(upsertSystemType.type, upsertSystemTypesSaga);
  yield takeLatest(deleteSystemType.type, deleteSystemTypesSaga);
}
