import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  fetchClientTickets,
  fetchClientTicketsFailure,
  fetchClientTicketsSuccess,
  fetchCompanyTickets,
  fetchCompanyTicketsFailure,
  fetchCompanyTicketsSuccess,
  fetchJobReport,
  fetchJobReportFailure,
  fetchJobReportSuccess,
  searchCompanyTickets,
  searchCompanyTicketsFailure,
  searchCompanyTicketsSuccess,
  submitTicket,
  submitTicketFailure,
  submitTicketSuccess,
} from "../actions/jobReportActions";
import {
  fetchClientTicketsApi,
  fetchCompanyTicketsApi,
  fetchJobReportApi,
  searchCompanyTicketsApi,
  submitTicketApi,
} from "../../api/jobReportApi";
import { mapJobReport } from "../../types/JobReport";
import {
  selectSearchedTicketsPage,
  selectTicketsPage,
} from "../selectors/jobReportSelector";
import { mapTicket, TicketView, TicketViewSQL } from "../../types/Ticket";
import { PostgrestError } from "@supabase/supabase-js";

function* submitTicketSaga(action: ReturnType<typeof submitTicket>) {
  try {
    const ticketInProgress = action.payload;
    const { data, error } = yield call(submitTicketApi, ticketInProgress);

    if (error) throw error;

    const newTicket = mapTicket(data);
    yield put(submitTicketSuccess(newTicket));
  } catch (error) {
    yield put(submitTicketFailure((error as Error).message));
  }
}

function* fetchClientTicketsSaga(
  action: ReturnType<typeof fetchClientTickets>
) {
  try {
    const { clientId } = action.payload;
    if (clientId) {
      const {
        data,
        error,
      }: { data: TicketViewSQL[]; error: PostgrestError | null } = yield call(
        fetchClientTicketsApi,
        clientId
      );

      if (error) throw error;
      const clientTickets = data.map((report) => mapTicket(report));

      yield put(fetchClientTicketsSuccess(clientTickets));
    }
  } catch (error) {
    yield put(fetchClientTicketsFailure((error as Error).message));
  }
}

function* fetchCompanyTicketsSaga(
  action: ReturnType<typeof fetchCompanyTickets>
) {
  try {
    const { companyId } = action.payload;
    if (companyId) {
      const page: number = yield select(selectTicketsPage);
      const { data, error } = yield call(
        fetchCompanyTicketsApi,
        page,
        companyId
      );
      if (error) throw error;
      const tickets: TicketView[] = data.map((report: TicketViewSQL) =>
        mapTicket(report)
      );
      yield put(fetchCompanyTicketsSuccess(tickets));
    }
  } catch (error) {
    yield put(fetchCompanyTicketsFailure((error as Error).message));
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

function* searchCompanyTicketsSaga(
  action: ReturnType<typeof searchCompanyTickets>
) {
  try {
    const { companyId, query, date } = action.payload;
    const page: number = yield select(selectSearchedTicketsPage);
    const { data, error } = yield call(searchCompanyTicketsApi, {
      companyId,
      query,
      page,
      date,
    });
    if (error) throw error;
    const ticketsHistory = data.map((report: any) => mapTicket(report));
    yield put(searchCompanyTicketsSuccess(ticketsHistory));
  } catch (error) {
    yield put(searchCompanyTicketsFailure((error as Error).message));
  }
}

export default function* jobReportSaga() {
  yield takeLatest(submitTicket.type, submitTicketSaga);
  yield takeLatest(fetchClientTickets.type, fetchClientTicketsSaga);
  yield takeLatest(fetchCompanyTickets.type, fetchCompanyTicketsSaga);
  yield takeLatest(fetchJobReport.type, fetchJobReportSaga);
  yield takeLatest(searchCompanyTickets.type, searchCompanyTicketsSaga);
}
