'use client';

import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import AppNav from '@/components/app/AppNav';
import ModelModal from '@/components/shared/ModelModal';
import Toast from '@/components/shared/Toast';
import { setSession } from '@/store/authSlice';
import { apiSession, apiGuest } from '@/lib/api';

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
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        <AppNav />
        <div className="flex-1 flex overflow-hidden">{children}</div>
      </motion.div>
      <ModelModal />
      <Toast />
    </>
  );
}
