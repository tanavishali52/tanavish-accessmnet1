'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { setSession, AuthUser } from '@/store/authSlice';
import { hydrateChatState, type PersistedChatState } from '@/store/chatSlice';
import CatalogBootstrap from '@/providers/CatalogBootstrap';

const USER_STORAGE_KEY = 'nexusai:user';
const CHAT_STATE_STORAGE_PREFIX = 'nexusai:chatState:';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Client-only session hydration (simple demo auth, persisted in localStorage).
    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.id && parsed?.email) {
        store.dispatch(setSession(parsed));
        const chatRaw = window.localStorage.getItem(`${CHAT_STATE_STORAGE_PREFIX}${parsed.id}`);
        if (chatRaw) {
          const chatParsed = JSON.parse(chatRaw) as PersistedChatState;
          if (chatParsed && Array.isArray(chatParsed.messages)) {
            store.dispatch(hydrateChatState(chatParsed));
          }
        }
      }
    } catch {
      // If storage is corrupt, ignore it.
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  return (
    <Provider store={store}>
      <CatalogBootstrap />
      {children}
    </Provider>
  );
}
