import { configureStore } from "@reduxjs/toolkit";
import storePersist from "./storePersist";

import { reducer as authReducer } from './auth';
import { reducer as settingsReducer } from './settings';
import { reducer as pdfToolsReducer } from './pdfTools';
import { reducer as appReducer } from './app';
import { reducer as profileUiReducer } from './profileUi';
import { reducer as pdfReducer } from './pdf';

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

const auth_state = storePersist.get('auth') ? storePersist.get('auth') : AUTH_INITIAL_STATE;

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    pdfTools: pdfToolsReducer,
    app: appReducer,
    profileUi: profileUiReducer,
    pdf: pdfReducer,
  },
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false,
});

export default store;