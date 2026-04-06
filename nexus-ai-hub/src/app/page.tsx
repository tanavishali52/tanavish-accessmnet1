'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import FeaturedModels from '@/components/landing/FeaturedModels';
import Footer from '@/components/landing/Footer';
import AppNav from '@/components/app/AppNav';
import ChatView from '@/components/app/chat/ChatView';
import MarketplaceView from '@/components/app/marketplace/MarketplaceView';
import AgentsView from '@/components/app/agents/AgentsView';
import ResearchView from '@/components/app/research/ResearchView';
import ModelModal from '@/components/shared/ModelModal';
import Toast from '@/components/shared/Toast';
import { openApp, ActiveTab } from '@/store/appSlice';

export default function Home() {
  const dispatch = useDispatch();
  const { activePage, activeTab } = useSelector((s: RootState) => s.app);

  useEffect(() => {
    const open = new URLSearchParams(window.location.search).get('open');
    if (!open) return;
    if (open === 'chat' || open === 'marketplace' || open === 'agents' || open === 'research') {
      dispatch(openApp(open as ActiveTab));
    }

    // Clean the URL (keeps the app state in Redux).
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('open');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [dispatch]);

  return (
    <>
      <AnimatePresence mode="wait">
        {activePage === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-screen flex-col md:flex-row"
            style={{ background: 'var(--bg)' }}
          >
            <Navbar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <Hero />
              <FeaturedModels />
              <Footer />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex h-screen flex-col overflow-hidden md:flex-row"
            style={{ background: 'var(--bg)' }}
          >
            <AppNav />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 overflow-hidden">
                    <ChatView />
                  </motion.div>
                )}
                {activeTab === 'marketplace' && (
                  <motion.div key="marketplace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                    <MarketplaceView />
                  </motion.div>
                )}
                {activeTab === 'agents' && (
                  <motion.div key="agents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                    <AgentsView />
                  </motion.div>
                )}
                {activeTab === 'research' && (
                  <motion.div key="research" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
                    <ResearchView />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModelModal />
      <Toast />
    </>
  );
}
