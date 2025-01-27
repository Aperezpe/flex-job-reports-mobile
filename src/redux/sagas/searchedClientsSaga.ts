import { call, put, takeLatest } from "redux-saga/effects";
import {
  ClientAndAddresses,
  mapClientAndAddresses,
} from "../../types/ClientAndAddresses";
import {
  searchClientByNameOrAddress,
  searchClientByNameOrAddressFailure,
  searchClientByNameOrAddressSuccess,
} from "../actions/searchedClientsActions";
import { searchClientByNameOrAddressApi } from "../../api/searchedClientsApi";
import { AddressSQL } from "../../types/Address";

function* searchClientByNameOrAddressSaga(
  action: ReturnType<typeof searchClientByNameOrAddress>
) {
  try {
    const { companyId, query } = action.payload;

    const { data, error } = yield call(
      searchClientByNameOrAddressApi,
      companyId,
      query
    );

    if (error) throw error;

    const clientsWithSortedAddresses: ClientAndAddresses[] = data.map(
      (client: ClientAndAddresses) => {
        client.addresses?.sort((a: AddressSQL, b: AddressSQL) => {
          const aMatches = a.address_string?.includes(query ?? "") ? 1 : 0;
          const bMatches = b.address_string?.includes(query ?? "") ? 1 : 0;
          return bMatches - aMatches; // Prioritize matches
        });
        return client;
      }
    );

    const clientsRes = clientsWithSortedAddresses.map((client) =>
      mapClientAndAddresses(client)
    );

    yield put(searchClientByNameOrAddressSuccess(clientsRes));
  } catch (error) {
    yield put(searchClientByNameOrAddressFailure((error as Error).message));
  }
}

export default function* clientsSaga() {
  yield takeLatest(
    searchClientByNameOrAddress.type,
    searchClientByNameOrAddressSaga
  );
  // yield takeLatest(
  //   searchClientByNameOrAddress.type,
  //   searchClientByNameOrAddressSaga
  // );
  // yield takeLatest(addClient.type, addClientSaga);
  // yield takeLatest(removeClient.type, removeClientSaga);
}
