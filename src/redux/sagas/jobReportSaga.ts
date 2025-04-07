import { call, put, takeLatest } from "redux-saga/effects";
import { submitJobReport, submitJobReportFailure, submitJobReportSuccess } from "../actions/jobReportActions";
import { submitJobReportApi } from "../../api/jobReportApi";

function* submitJobReportSaga(action: ReturnType<typeof submitJobReport>) {
  
  try {
      const jobReport = action.payload;
      const { error } = yield call(submitJobReportApi, jobReport);

      if (error) throw error;
  
      yield put(submitJobReportSuccess());
    } catch (error) {
      yield put(submitJobReportFailure((error as Error).message));
    }
}

export default function* jobReportSaga() {
  yield takeLatest(submitJobReport.type, submitJobReportSaga);
}
