import { call, put, select, takeLatest } from "redux-saga/effects";
import { fetchCompanyTechniciansApi } from "../../api/techniciansApi";
import { fetchCompanyTechnicians, fetchCompanyTechniciansFailure, fetchCompanyTechniciansSuccess } from "../actions/techniciansActions";
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { AppUser, mapAppUserSQLToAppUser } from "../../types/Auth/AppUser";

function* fetchCompanyTechniciansSaga() {
  const { appCompany } = yield select(selectAppCompanyAndUser);
  try {
    if (!appCompany) throw Error("App Company is not defined yet");
    
    const { data, error } = yield call(fetchCompanyTechniciansApi, appCompany.id);

    if (error) throw error;

    const technicians: AppUser[] = data.map(mapAppUserSQLToAppUser);

    yield put(fetchCompanyTechniciansSuccess(technicians));
  } catch (error) {
    yield put(fetchCompanyTechniciansFailure((error as Error).message));
  }
}


export default function* techniciansSaga() {
  yield takeLatest(fetchCompanyTechnicians, fetchCompanyTechniciansSaga);
}