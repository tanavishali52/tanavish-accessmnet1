'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { setSession, AuthUser } from '@/store/authSlice';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Client-only session hydration (simple demo auth, persisted in localStorage).
    try {
      const raw = window.localStorage.getItem('nexusai:user');
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.id && parsed?.email) store.dispatch(setSession(parsed));
    } catch {
      // If storage is corrupt, ignore it.
      window.localStorage.removeItem('nexusai:user');
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
