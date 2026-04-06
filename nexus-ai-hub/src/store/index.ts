import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import chatReducer from './chatSlice';
import { addSession, setCurrentSessionId, resetChat } from './chatSlice';
import modelsReducer from './modelsSlice';
import modalReducer from './modalSlice';
import authReducer, { setSession, logout, loginSuccess, signupSuccess, type AuthUser } from './authSlice';
import agentReducer from './agentSlice';
import { CHAT_SESSION_STORAGE_KEY } from '@/lib/chatStorageKeys';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(setSession, loginSuccess, signupSuccess, logout),
  effect: (action, api) => {
    if (typeof window === 'undefined') return;
    if (logout.match(action)) {
      window.localStorage.removeItem('nexusai:user');
      window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      api.dispatch(resetChat());
      return;
    }
    if (setSession.match(action) && action.payload === null) {
      window.localStorage.removeItem('nexusai:user');
      window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      api.dispatch(resetChat());
      return;
    }
    let user: AuthUser | null = null;
    if (setSession.match(action)) user = action.payload;
    else if (loginSuccess.match(action) || signupSuccess.match(action)) user = action.payload;
    if (user?.id && user?.email) {
      try {
        window.localStorage.setItem('nexusai:user', JSON.stringify(user));
      } catch {
        /* quota */
      }
    }
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(addSession, setCurrentSessionId, resetChat),
  effect: (action, api) => {
    if (typeof window === 'undefined') return;
    if (resetChat.match(action)) {
      window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      return;
    }
    const id = (api.getState() as { chat: { currentSessionId: string | null } }).chat
      .currentSessionId;
    if (id) window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, id);
    else window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
  },
});

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
    }).prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
