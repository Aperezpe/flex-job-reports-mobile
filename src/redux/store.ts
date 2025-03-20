import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import clientsReducer from "./reducers/clientsReducer";
import clientsSaga from "./sagas/clientsSaga";
import sessionDataSaga from "./sagas/sessionDataSaga";
import clientDetailsSaga from "./sagas/clientDetailsSaga";
import sessionDataReducer from './reducers/sessionDataReducer';
import clientDetailsReducer from "./reducers/clientDetailsReducer";
import searchedClientsReducer from "./reducers/searchedClientsReducer";
import searchedClientsSaga from "./sagas/searchedClientsSaga";
import { logout } from "./actions/appActions";

const sagaMiddleware = createSagaMiddleware();

const combinedReducer = combineReducers({
  clients: clientsReducer,
  searchedClients: searchedClientsReducer,
  clientDetails: clientDetailsReducer,
  sessionData: sessionDataReducer,
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
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(clientsSaga);
sagaMiddleware.run(searchedClientsSaga);
sagaMiddleware.run(sessionDataSaga);
sagaMiddleware.run(clientDetailsSaga);

export type RootState = ReturnType<typeof store.getState>;

export default store;
