// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import clientsReducer from "./reducers/clientsReducer";
import clientsSaga from "./sagas/clientsSaga";
import sessionDataSaga from "./sagas/sessionDataSaga";
import clientDetailsSaga from "./sagas/clientDetailsSaga";
import sessionDataReducer from './reducers/sessionDataReducer';
import clientDetailsReducer from "./reducers/clientDetailsReducer";
import searchedClientsReducer from "./reducers/searchedClientsReducer";
import searchedClientsSaga from "./sagas/searchedClientsSaga";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    clients: clientsReducer,
    searchedClients: searchedClientsReducer, 
    clientDetails: clientDetailsReducer,
    sessionData: sessionDataReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(clientsSaga);
sagaMiddleware.run(searchedClientsSaga);
sagaMiddleware.run(sessionDataSaga);
sagaMiddleware.run(clientDetailsSaga);

export type RootState = ReturnType<typeof store.getState>;

export default store;
