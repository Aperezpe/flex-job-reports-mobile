import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  fetchForm,
  fetchFormFailure,
  fetchFormSuccess,
  saveForm,
  saveFormFailure,
  saveFormSuccess,
} from "../actions/systemFormActions";
import {
  getFormBySystemTypeApi,
  updateFormApi,
} from "../../api/formsManagementApi";
import { selectSystemForm } from "../selectors/systemFormSelector";
import { SystemForm } from "../../types/SystemForm";

function* saveFormSaga() {
  const systemForm: SystemForm = yield select(selectSystemForm);

  try {
    if (!systemForm) throw Error("System Form is not defined yet");

    const { error } = yield call(updateFormApi, systemForm);

    if (error) throw error;

    yield put(saveFormSuccess());
  } catch (error) {
    yield put(saveFormFailure((error as Error).message));
  }
}

function* fetchFormSaga(action: ReturnType<typeof fetchForm>) {
  try {
    const { data, error } = yield call(getFormBySystemTypeApi, action.payload);

    if (error) throw error;

    yield put(fetchFormSuccess(data));
  } catch (error) {
    yield put(fetchFormFailure((error as Error).message));
  }
}

export default function* systemFormSaga() {
  yield takeLatest(saveForm.type, saveFormSaga);
  yield takeLatest(fetchForm.type, fetchFormSaga);
}
