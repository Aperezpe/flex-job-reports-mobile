import { call, put, takeLatest } from "redux-saga/effects";
import { submitJobReport, submitJobReportFailure, submitJobReportSuccess } from "../actions/jobReportActions";
import { submitJobReportApi } from "../../api/jobReportApi";
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

export default function* jobReportSaga() {
  yield takeLatest(submitJobReport.type, submitJobReportSaga);
}
