import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchCompanyAndUser,
  fetchCompanyAndUserFailure,
  fetchCompanyAndUserSuccess,
} from "../actions/sessionDataActions";
import { UserAndCompanySQL } from "../../types/Auth/SignUpCompanyAdmin";
import { mapUserSQLToAppUser } from "../../types/Auth/AppUser";
import { mapCompanySQLToCompany } from "../../types/Company";
import { fetchCompanyAndUserApi } from "../../api/sessionDataApi";

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

export default function* sessionDataSaga() {
  yield takeLatest(fetchCompanyAndUser.type, fetchCompanyAndUserSaga);
}
