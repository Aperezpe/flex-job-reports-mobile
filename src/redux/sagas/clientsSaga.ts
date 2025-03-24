import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  fetchClients,
  fetchClientsSuccess,
  fetchClientsFailure,
  addClient,
  addClientFailure,
  addClientSuccess,
  removeClient,
  removeClientSuccess,
  removeClientFailure,
} from "../actions/clientsActions";
import { addClientApi, fetchClientsApi, removeClientIdApi } from "../../api/clientsApi";
import { selectClientPage } from "../selectors/clientsSelectors";
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { Client, mapClient } from "../../types/Client";

function* fetchClientsSaga() {
  const { appCompany } = yield select(selectAppCompanyAndUser);
  try {
    if (!appCompany) throw Error("App Company is not defined yet");

    const page: number = yield select(selectClientPage);
    const { data, error } = yield call(fetchClientsApi, page, appCompany.id);

    if (error) throw error;

    const clients: Client[] = data.map(mapClient);
    yield put(fetchClientsSuccess(clients));
  } catch (error) {
    yield put(fetchClientsFailure((error as Error).message));
  }
}

function* addClientSaga(action: ReturnType<typeof addClient>) {
  const { appCompany } = yield select(selectAppCompanyAndUser);
  try {
    if (!appCompany) throw Error("App Company is not defined yet");

    const { data, error } = yield call(
      addClientApi,
      action.payload,
      appCompany.id
    );

    if (error) throw error;

    const newClient = mapClient(data);
    yield put(addClientSuccess(newClient));
  } catch (error) {
    yield put(addClientFailure((error as Error).message));
  }
}

function* removeClientSaga(action: ReturnType<typeof removeClient>) {
  try {
    const clientId = action.payload;
    const { data, error } = yield call(removeClientIdApi, clientId);
    if (error) throw error;

    yield put(removeClientSuccess(data.id));
  } catch (error) {
    yield put(removeClientFailure((error as Error).message));
  }
}

export default function* clientsSaga() {
  yield takeLatest(fetchClients.type, fetchClientsSaga);
  yield takeLatest(addClient.type, addClientSaga);
  yield takeLatest(removeClient.type, removeClientSaga);
}
