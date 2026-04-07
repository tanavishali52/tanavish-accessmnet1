'use client';

import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import AppNav from '@/components/app/AppNav';
import ModelModal from '@/components/shared/ModelModal';
import Toast from '@/components/shared/Toast';
import { setSession } from '@/store/authSlice';
import { apiSession, apiGuest } from '@/lib/api';

const USER_STORAGE_KEY = 'nexusai:user';

interface StoredGuestSession {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  guestMode: true;
}

const getStoredGuestSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      id?: string;
      name?: string;
      email?: string;
      avatar?: string;
      plan?: 'free' | 'pro' | 'enterprise';
      guestMode?: boolean;
    };
    if (!parsed?.guestMode || !parsed.id || !parsed.name || !parsed.email || !parsed.plan) {
      return null;
    }
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      avatar: parsed.avatar,
      plan: parsed.plan,
      guestMode: true,
    } satisfies StoredGuestSession;
  } catch {
    return null;
  }
};

export default function ResearchAppShell({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    apiSession()
      .then(({ authenticated, user }) => {
        if (authenticated && user) {
          dispatch(
            setSession({
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.name[0]?.toUpperCase() ?? 'U',
              plan: user.plan,
              guestMode: false,
            }),
          );
        } else {
          const storedGuest = getStoredGuestSession();
          if (storedGuest) {
            dispatch(
              setSession({
                id: storedGuest.id,
                name: storedGuest.name,
                email: storedGuest.email,
                avatar: storedGuest.avatar ?? storedGuest.name[0]?.toUpperCase() ?? 'G',
                plan: storedGuest.plan,
                guestMode: true,
              }),
            );
            return;
          }
          apiGuest()
            .then((guestUser) => {
              dispatch(
                setSession({
                  id: guestUser.id,
                  name: guestUser.name,
                  email: guestUser.email,
                  avatar: guestUser.name[0]?.toUpperCase() ?? 'G',
                  plan: guestUser.plan,
                  guestMode: true,
                }),
              );
            })
            .catch((err) => {
              console.error('Failed to create guest session', err);
              dispatch(setSession(null));
            });
        }
      })
      .catch((err) => {
        console.warn('Session check failed, trying guest:', err);
        const storedGuest = getStoredGuestSession();
        if (storedGuest) {
          dispatch(
            setSession({
              id: storedGuest.id,
              name: storedGuest.name,
              email: storedGuest.email,
              avatar: storedGuest.avatar ?? storedGuest.name[0]?.toUpperCase() ?? 'G',
              plan: storedGuest.plan,
              guestMode: true,
            }),
          );
          return;
        }
        apiGuest()
          .then((guestUser) => {
            dispatch(
              setSession({
                id: guestUser.id,
                name: guestUser.name,
                email: guestUser.email,
                avatar: guestUser.name[0]?.toUpperCase() ?? 'G',
                plan: guestUser.plan,
                guestMode: true,
              }),
            );
          })
          .catch((e) => {
            console.error('Failed to create guest session', e);
            dispatch(setSession(null));
          });
      });
  }, [dispatch]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex h-screen flex-col overflow-hidden md:flex-row"
        style={{ background: 'var(--bg)' }}
      >
        <AppNav />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </motion.div>
      <ModelModal />
      <Toast />
    </>
  );
}
