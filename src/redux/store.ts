import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import clientsSaga from "./sagas/clientsSaga";
import sessionDataSaga from "./sagas/sessionDataSaga";
import clientDetailsSaga from "./sagas/clientDetailsSaga";
import sessionDataReducer from "./reducers/sessionDataReducer";
import clientDetailsReducer from "./reducers/clientDetailsReducer";
import searchedClientsReducer from "./reducers/searchedClientsReducer";
import searchedClientsSaga from "./sagas/searchedClientsSaga";
import clientsReducer from "./reducers/clientsReducer";
import systemFormReducer from "./reducers/systemFormReducer";
import { logout } from "./actions/appActions";
import systemFormSaga from "./sagas/systemFormSaga";
import jobReportReducer from "./reducers/jobReportReducer";
import jobReportSaga from "./sagas/jobReportSaga";
import techniciansReducer from "./reducers/techniciansReducer";
import techniciansSaga from "./sagas/techniciansSaga";

const sagaMiddleware = createSagaMiddleware();

const combinedReducer = combineReducers({
  clients: clientsReducer,
  searchedClients: searchedClientsReducer,
  clientDetails: clientDetailsReducer,
  sessionData: sessionDataReducer,
  systemForm: systemFormReducer,
  jobReport: jobReportReducer,
  technicians: techniciansReducer,
});

// Root reducer with reset capability
const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    // Reset state to initial values
    state = combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

sagaMiddleware.run(clientsSaga);
sagaMiddleware.run(searchedClientsSaga);
sagaMiddleware.run(sessionDataSaga);
sagaMiddleware.run(clientDetailsSaga);
sagaMiddleware.run(systemFormSaga);
sagaMiddleware.run(jobReportSaga);
sagaMiddleware.run(techniciansSaga);

export type RootState = ReturnType<typeof store.getState>;

export default store;
