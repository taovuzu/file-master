import { configureStore } from "@reduxjs/toolkit";
import storePersist from "./storePersist";

import { reducer as authReducer } from './auth';
import { reducer as settingsReducer } from './settings';
import { reducer as pdfToolsReducer } from './pdfTools';
import { reducer as appReducer } from './app';

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false
};

const auth_state = storePersist.get('auth') ? storePersist.get('auth') : AUTH_INITIAL_STATE;

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    pdfTools: pdfToolsReducer,
    app: appReducer
  },
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Optimize serializable check for better performance
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist']
      },
      // Disable immutable check in production for better performance
      immutableCheck: import.meta.env.PROD ? false : { warnAfter: 32 },
      // Optimize action creator check
      actionCreatorCheck: import.meta.env.PROD ? false : { warnAfter: 32 }
    })
});

export default store;