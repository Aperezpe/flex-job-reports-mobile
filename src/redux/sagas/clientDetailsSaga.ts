import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  upsertAddress,
  upsertAddressFailure,
  upsertSystem,
  upsertSystemFailure,
  upsertSystemSuccess,
  fetchClientById,
  fetchClientByIdFailure,
  fetchClientByIdSuccess,
  removeAddress,
  removeAddressFailure,
  removeAddressSuccess,
  removeSystem,
  removeSystemSuccess,
  removeSystemFailure,
  upsertAddressSuccess,
} from "../actions/clientDetailsActions";
import {
  upsertAddressApi,
  fetchClientByIdApi,
  removeAddressApi,
  upsertSystemApi,
  removeSystemApi,
} from "../../api/clientDetailsApi";
import { selectClientDetails } from "../selectors/clientDetailsSelector";
import { mapAddress } from "../../types/Address";
import { mapSystem } from "../../types/System";
import { Client, mapClient } from "../../types/Client";
import { upsertClientAddress } from "../actions/clientsActions";

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

    if (client.id !== undefined) {
      yield put(
        upsertClientAddress({ clientId: client.id, address: upsertedAddress })
      );
    } else {
      throw new Error("Client ID is undefined");
    }
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

function* upsertSystemSaga(action: ReturnType<typeof upsertSystem>) {
  const { values, addressId, systemId } = action.payload;
  try {
    const { data, error } = yield call(
      upsertSystemApi,
      values,
      addressId,
      systemId
    );

    if (error) throw error;

    const newSystem = mapSystem(data);
    yield put(upsertSystemSuccess(newSystem));
  } catch (error) {
    yield put(upsertSystemFailure((error as Error).message));
  }
}

function* removeSystemSaga(action: ReturnType<typeof removeSystem>) {
  try {
    const { error } = yield call(
      removeSystemApi,
      action.payload.addressId,
      action.payload.systemId
    );
    if (error) throw error;

    yield put(removeSystemSuccess(action.payload));
  } catch (error) {
    yield put(removeSystemFailure((error as Error).message));
  }
}

export default function* clientsSaga() {
  yield takeLatest(fetchClientById.type, fetchClientByIdSaga);
  yield takeLatest(upsertAddress.type, upsertAddressSaga);
  yield takeLatest(removeAddress.type, removeAddressSaga);
  yield takeLatest(upsertSystem.type, upsertSystemSaga);
  yield takeLatest(removeSystem.type, removeSystemSaga);
}
