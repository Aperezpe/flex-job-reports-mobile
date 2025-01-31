import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  upsertAddress,
  upsertAddressFailure,
  upsertAddressSuccess,
  addSystem,
  addSystemFailure,
  addSystemSuccess,
  fetchClientById,
  fetchClientByIdFailure,
  fetchClientByIdSuccess,
  removeAddress,
  removeAddressFailure,
  removeAddressSuccess,
} from "../actions/clientDetailsActions";
import {
  upsertAddressApi,
  addSystemApi,
  fetchClientByIdApi,
  removeAddressApi,
} from "../../api/clientDetailsApi";
import { selectClientDetails } from "../selectors/clientDetailsSelector";
import { mapAddress } from "../../types/Address";
import { mapSystem } from "../../types/System";
import { Client, mapClient } from "../../types/Client";

function* fetchClientByIdSaga(action: ReturnType<typeof fetchClientById>) {
  const clientId = action.payload;

  try {
    const { data, error } = yield call(fetchClientByIdApi, clientId);

    if (error) throw error;

    const client = mapClient(data);
    yield put(fetchClientByIdSuccess(client));
  } catch (error) {
    yield put(fetchClientByIdFailure((error as Error).message));
  }
}

function* upsertAddressSaga(action: ReturnType<typeof upsertAddress>) {
  const client: Client = yield select(selectClientDetails);
  const { values, addressId } = action.payload;
  console.log(values, client.id, addressId)
  try {
    const { data, error } = yield call(
      upsertAddressApi,
      values,
      client.id,
      addressId
    );

    if (error) throw error;

    const upsertedAddress = mapAddress(data);
    yield put(upsertAddressSuccess(upsertedAddress));
  } catch (error) {
    yield put(upsertAddressFailure((error as Error).message));
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

function* addSystemSaga(action: ReturnType<typeof addSystem>) {
  const { values, addressId } = action.payload;
  try {
    const { data, error } = yield call(addSystemApi, values, addressId);

    if (error) throw error;

    const newSystem = mapSystem(data);
    yield put(addSystemSuccess(newSystem));
  } catch (error) {
    yield put(addSystemFailure((error as Error).message));
  }
}

export default function* clientsSaga() {
  yield takeLatest(fetchClientById.type, fetchClientByIdSaga);
  yield takeLatest(upsertAddress.type, upsertAddressSaga);
  yield takeLatest(removeAddress.type, removeAddressSaga);
  yield takeLatest(addSystem.type, addSystemSaga);
}
