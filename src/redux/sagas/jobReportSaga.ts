import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchClientJobReportsHistory,
  fetchClientJobReportsHistoryFailure,
  fetchClientJobReportsHistorySuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  submitJobReport,
  submitJobReportFailure,
  submitJobReportSuccess,
} from "../actions/jobReportActions";
import {
  fetchClientJobReportsApi,
  fetchJobReportApi,
  submitJobReportApi,
} from "../../api/jobReportApi";
import { mapJobReport } from "../../types/JobReport";

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
    } else {
    }
  } catch (error) {
    yield put(fetchClientJobReportsHistoryFailure((error as Error).message));
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

export default function* jobReportSaga() {
  yield takeLatest(submitJobReport.type, submitJobReportSaga);
  yield takeLatest(
    fetchClientJobReportsHistory.type,
    fetchClientJobReportsHistorySaga
  );
  yield takeLatest(fetchJobReport.type, fetchJobReportSaga);
}
