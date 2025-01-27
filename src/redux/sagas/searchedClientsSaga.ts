import { call, put, select, takeLatest } from "redux-saga/effects";
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
import { selectAppCompanyAndUser } from "../selectors/sessionDataSelectors";
import { Company } from "../../types/Company";

function* searchClientByNameOrAddressSaga(
  action: ReturnType<typeof searchClientByNameOrAddress>
) {
  const { appCompany }: { appCompany: Company | null } = yield select(
    selectAppCompanyAndUser
  );
  try {
    const query = action.payload;

    if (!appCompany?.id)
      throw Error(
        "Company not available, if this error persists, contact support!"
      );

    const { data, error } = yield call(
      searchClientByNameOrAddressApi,
      appCompany?.id,
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

export default function* searchedClientsSaga() {
  yield takeLatest(
    searchClientByNameOrAddress.type,
    searchClientByNameOrAddressSaga
  );
}
