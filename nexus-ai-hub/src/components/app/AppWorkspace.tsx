'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import AppNav from '@/components/app/AppNav';
import ChatView from '@/components/app/chat/ChatView';
import MarketplaceView from '@/components/app/marketplace/MarketplaceView';
import AgentsView from '@/components/app/agents/AgentsView';
import ResearchView from '@/components/app/research/ResearchView';
import ModelModal from '@/components/shared/ModelModal';
import Toast from '@/components/shared/Toast';
import { ActiveTab, openApp } from '@/store/appSlice';
import { setSession } from '@/store/authSlice';
import type { RootState } from '@/store';
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

export default function AppWorkspace({ tab, requireMember }: { tab: ActiveTab; requireMember?: boolean }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const authUser = useSelector((s: RootState) => s.auth.user);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    dispatch(openApp(tab));
  }, [dispatch, tab]);

  // Restore session from backend cookie on mount, or create guest session
  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      const applyGuest = async () => {
        const storedGuest = getStoredGuestSession();
        if (storedGuest) {
          dispatch(setSession({
            id: storedGuest.id,
            name: storedGuest.name,
            email: storedGuest.email,
            avatar: storedGuest.avatar ?? storedGuest.name[0]?.toUpperCase() ?? 'G',
            plan: storedGuest.plan,
            guestMode: true,
          }));
          return;
        }
        try {
          const guestUser = await apiGuest();
          if (cancelled) return;
          dispatch(setSession({
            id: guestUser.id,
            name: guestUser.name,
            email: guestUser.email,
            avatar: guestUser.name[0]?.toUpperCase() ?? 'G',
            plan: guestUser.plan,
            guestMode: true,
          }));
        } catch (err) {
          console.error('Failed to create guest session', err);
          if (!cancelled) dispatch(setSession(null));
        }
      };

      try {
        const { authenticated, user } = await apiSession();
        if (cancelled) return;
        if (authenticated && user) {
          dispatch(setSession({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.name[0]?.toUpperCase() ?? 'U',
            plan: user.plan,
            guestMode: false,
          }));
        } else {
          await applyGuest();
        }
      } catch (err) {
        console.warn('Session check failed, trying guest:', err);
        await applyGuest();
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    };

    void hydrateSession();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!requireMember || !sessionReady) return;
    if (!authUser || authUser.guestMode) {
      router.replace(`/login?next=${encodeURIComponent('/agents')}`);
    }
  }, [requireMember, sessionReady, authUser, router]);

  const memberBlocked =
    requireMember && sessionReady && (!authUser || Boolean(authUser.guestMode));

  if (!sessionReady || memberBlocked) {
    return (
      <div
        className="flex h-screen min-h-[100dvh] w-full items-center justify-center font-instrument text-text2"
        style={{ background: 'var(--bg)' }}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/[0.12] border-t-accent" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {tab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 overflow-hidden">
                <ChatView />
              </motion.div>
            )}
            {tab === 'marketplace' && (
              <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                <MarketplaceView />
              </motion.div>
            )}
            {tab === 'agents' && (
              <motion.div key="agents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                <AgentsView />
              </motion.div>
            )}
            {tab === 'research' && (
              <motion.div key="research" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                <ResearchView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <ModelModal />
      <Toast />
    </>
  );
}

