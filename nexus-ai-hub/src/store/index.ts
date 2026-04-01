import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import chatReducer from './chatSlice';
import modelsReducer from './modelsSlice';
import modalReducer from './modalSlice';
import authReducer from './authSlice';
import agentReducer from './agentSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    chat: chatReducer,
    models: modelsReducer,
    modal: modalReducer,
    auth: authReducer,
    agent: agentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
