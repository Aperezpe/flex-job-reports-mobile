import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  fetchClientJobReportsHistory,
  fetchClientJobReportsHistoryFailure,
  fetchClientJobReportsHistorySuccess,
  fetchCompanyJobReportsHistory,
  fetchCompanyJobReportsHistoryFailure,
  fetchCompanyJobReportsHistorySuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  searchCompanyJobReports,
  searchCompanyJobReportsFailure,
  searchCompanyJobReportsSuccess,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";
import {
  fetchClientJobReportsApi,
  fetchCompanyJobReportsApi,
  fetchJobReportApi,
  searchCompanyJobReportsApi,
  submitJobReportApi,
} from "../../api/jobReportApi";
import { mapJobReport, mapJobReportView } from "../../types/JobReport";
import { selectJobReportsPage, selectSearchedJobReportsPage } from "../selectors/jobReportSelector";

function* submitJobReportSaga(action: ReturnType<typeof submitJobReport>) {
  try {
    const jobReportReq = action.payload;
    const { data, error } = yield call(submitJobReportApi, jobReportReq);

    if (error) throw error;

    const jobReportRes = mapJobReport(data);
    yield put(submitJobReportSuccess(jobReportRes));
  } catch (error) {
    yield put(submitJobReportFailure((error as Error).message));
  }
}

function* fetchClientJobReportsHistorySaga(
  action: ReturnType<typeof fetchClientJobReportsHistory>
) {
  try {
    const { clientId } = action.payload;
    if (clientId) {
      const { data, error } = yield call(fetchClientJobReportsApi, clientId);
      if (error) throw error;
      const jobReportsHistory = data.map((report: any) => mapJobReport(report));
      yield put(fetchClientJobReportsHistorySuccess(jobReportsHistory));
    }
  } catch (error) {
    yield put(fetchClientJobReportsHistoryFailure((error as Error).message));
  }
}

function* fetchCompanyJobReportsHistorySaga(
  action: ReturnType<typeof fetchCompanyJobReportsHistory>
) {
  try {
    const { companyId } = action.payload;
    if (companyId) {
      const page: number = yield select(selectJobReportsPage);
      const { data, error } = yield call(fetchCompanyJobReportsApi, page, companyId);
      if (error) throw error;
      const jobReportsHistory = data.map((report: any) => mapJobReportView(report));
      yield put(fetchCompanyJobReportsHistorySuccess(jobReportsHistory));
    }
  } catch (error) {
    yield put(fetchCompanyJobReportsHistoryFailure((error as Error).message));
  }
}

function* fetchJobReportSaga(action: ReturnType<typeof fetchJobReport>) {
  try {
    const jobReportId = action.payload;
    const { data, error } = yield call(fetchJobReportApi, jobReportId);
    if (error) throw error;
    const jobReport = mapJobReport(data);
    yield put(fetchJobReportSuccess(jobReport));
  } catch (error) {
    yield put(fetchJobReportFailure((error as Error).message));
  }
}

function* searchCompanyJobReportsSaga(action: ReturnType<typeof searchCompanyJobReports>) {
 try {
    const { companyId, query, date } = action.payload;
    const page: number = yield select(selectSearchedJobReportsPage);
    const { data, error } = yield call(searchCompanyJobReportsApi, {companyId, query, page, date });
    if (error) throw error;
      const jobReportsHistory = data.map((report: any) => mapJobReportView(report));
    yield put(searchCompanyJobReportsSuccess(jobReportsHistory));
  } catch (error) {
    yield put(searchCompanyJobReportsFailure((error as Error).message));
  }
}

export default function* jobReportSaga() {
  yield takeLatest(submitJobReport.type, submitJobReportSaga);
  yield takeLatest(
    fetchClientJobReportsHistory.type,
    fetchClientJobReportsHistorySaga
  );
  yield takeLatest(
    fetchCompanyJobReportsHistory.type,
    fetchCompanyJobReportsHistorySaga
  );
  yield takeLatest(fetchJobReport.type, fetchJobReportSaga);
  yield takeLatest(
    searchCompanyJobReports.type,
    searchCompanyJobReportsSaga
  )
}
