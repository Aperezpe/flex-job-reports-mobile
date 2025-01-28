import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  addAddress,
  addAddressFailure,
  addAddressSuccess,
  fetchClientById,
  fetchClientByIdFailure,
  fetchClientByIdSuccess,
  removeAddress,
  removeAddressFailure,
  removeAddressSuccess,
} from "../actions/clientDetailsActions";
import {
  addAddressApi,
  fetchClientByIdApi,
  removeAddressApi,
} from "../../api/clientDetailsApi";
import {
  ClientAndAddresses,
  mapClientAndAddresses,
} from "../../types/ClientAndAddresses";
import { selectClientDetails } from "../selectors/clientDetailsSelector";
import { mapAddress } from "../../types/Address";

function* fetchClientByIdSaga(action: ReturnType<typeof fetchClientById>) {
  const clientId = action.payload;

  try {
    const { data, error } = yield call(fetchClientByIdApi, clientId);

    if (error) throw error;

    const client = mapClientAndAddresses(data);
    yield put(fetchClientByIdSuccess(client));
  } catch (error) {
    yield put(fetchClientByIdFailure((error as Error).message));
  }
}

function* addAddressSaga(action: ReturnType<typeof addAddress>) {
  const client: ClientAndAddresses = yield select(selectClientDetails);
  try {
    const { data, error } = yield call(
      addAddressApi,
      action.payload,
      client.id
    );
    if (error) throw error;

    const newAddress = mapAddress(data);
    yield put(addAddressSuccess(newAddress));
  } catch (error) {
    yield put(addAddressFailure((error as Error).message));
  }
}

function* removeAddressSaga(action: ReturnType<typeof removeAddress>) {
  try {
    const { error } = yield call(removeAddressApi, action.payload);
    if (error) throw error;

    yield put(removeAddressSuccess(action.payload));
  } catch (error) {
    yield put(removeAddressFailure((error as Error).message));
  }
}

export default function* clientsSaga() {
  yield takeLatest(fetchClientById.type, fetchClientByIdSaga);
  yield takeLatest(addAddress.type, addAddressSaga);
  yield takeLatest(removeAddress.type, removeAddressSaga);
}
