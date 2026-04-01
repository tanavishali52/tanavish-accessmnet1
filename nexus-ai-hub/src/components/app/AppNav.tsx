'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { goHome, ActiveTab } from '@/store/appSlice';
import { logout } from '@/store/authSlice';
import { openModal } from '@/store/modalSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiZap, FiMessageSquare, FiShoppingBag, FiCpu, FiBookOpen, FiMenu, FiX, FiLogOut,
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { apiLogout } from '@/lib/api';

const TABS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'chat',        label: 'Chat Hub',     icon: <FiMessageSquare size={14} /> },
  { id: 'marketplace', label: 'Marketplace',  icon: <FiShoppingBag size={14} /> },
  { id: 'agents',      label: 'Agents',       icon: <FiCpu size={14} /> },
  { id: 'research',    label: 'Discover New', icon: <FiBookOpen size={14} /> },
];

const TAB_ROUTES: Record<ActiveTab, string> = {
  chat: '/chat',
  marketplace: '/marketplace',
  agents: '/agents',
  research: '/research',
};

export default function AppNav() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useSelector((s: RootState) => s.app.activeTab);
  const { items: models } = useSelector((s: RootState) => s.models);
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathTab = TABS.find((tab) => pathname === TAB_ROUTES[tab.id])?.id;
  const selectedTab = pathTab ?? activeTab;

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    dispatch(logout());
    router.push('/');
  };

  return (
    <div className="relative flex items-center justify-between px-3 sm:px-5 py-[0.6rem] sm:py-[0.7rem] bg-white border-b border-black/[0.08] flex-shrink-0 z-[100]">
      {/* Logo */}
      <button
        onClick={() => { dispatch(goHome()); router.push('/'); }}
        className="flex items-center gap-1.5 font-syne text-[1rem] sm:text-[1.2rem] font-bold text-text1 cursor-pointer flex-shrink-0"
        style={{ letterSpacing: '-0.03em' }}
      >
        <div className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] bg-accent rounded-[5px] flex items-center justify-center">
          <FiZap size={11} className="text-white" />
        </div>
        NexusAI
      </button>

      {/* Desktop Tabs */}
      <div className="hidden md:flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(TAB_ROUTES[tab.id])}
            className={`flex items-center gap-1.5 px-3 lg:px-4 py-[0.45rem] text-[0.78rem] lg:text-[0.82rem] font-medium rounded-full transition-all border-none cursor-pointer font-instrument ${
              selectedTab === tab.id
                ? 'bg-accent-lt text-accent'
                : 'bg-none text-text2 hover:bg-bg2 hover:text-text1'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile: active tab label */}
      <div className="flex md:hidden items-center gap-1.5 text-[0.82rem] font-medium text-accent bg-accent-lt px-3 py-1.5 rounded-full">
        {TABS.find((t) => t.id === selectedTab)?.icon}
        {TABS.find((t) => t.id === selectedTab)?.label}
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-2">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg border border-black/[0.1]">
              <div className="w-6 h-6 rounded-full bg-accent text-white text-[0.7rem] font-bold flex items-center justify-center flex-shrink-0">
                {user.avatar ?? user.name[0]?.toUpperCase()}
              </div>
              <span className="text-[0.8rem] text-text1 font-instrument max-w-[120px] truncate">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 border border-black/[0.14] text-text2 text-[0.82rem] px-3 py-2 rounded-full hover:border-red-400 hover:text-red-500 transition-all cursor-pointer font-instrument"
            >
              <FiLogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/login?next=/chat')}
              className="border border-black/[0.14] text-text2 text-[0.82rem] px-4 py-2 rounded-full hover:border-accent hover:text-accent transition-all cursor-pointer font-instrument"
            >
              Sign in
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const m = models.find((m) => m.id === 'gpt5') || models[0];
                if (m) dispatch(openModal({ model: m }));
              }}
              className="bg-accent text-white text-[0.82rem] font-medium px-4 py-2 rounded-full hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
            >
              Try free →
            </motion.button>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex md:hidden w-8 h-8 items-center justify-center text-text2 border border-black/[0.14] rounded-lg hover:bg-bg2 transition-colors"
      >
        {mobileOpen ? <FiX size={16} /> : <FiMenu size={16} />}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-black/[0.08] overflow-hidden md:hidden z-50"
          >
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { router.push(TAB_ROUTES[tab.id]); setMobileOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[0.82rem] font-medium transition-all border font-instrument ${
                    selectedTab === tab.id
                      ? 'bg-accent-lt border-accent/25 text-accent'
                      : 'bg-bg border-black/[0.08] text-text2 hover:text-accent hover:bg-accent-lt'
                  }`}
                  style={{ borderRadius: 10 }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <div className="px-3 pb-3 flex gap-2">
              {isAuthenticated && user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-black/[0.14] text-text1 text-[0.82rem] font-medium rounded-full py-2 hover:border-red-400 hover:text-red-500 transition-all cursor-pointer font-instrument"
                >
                  <FiLogOut size={13} /> Sign out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { router.push('/login?next=/chat'); setMobileOpen(false); }}
                    className="flex-1 border border-black/[0.14] text-text1 text-[0.82rem] font-medium rounded-full py-2 hover:border-accent hover:text-accent transition-all cursor-pointer font-instrument"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { const m = models.find((m) => m.id === 'gpt5') || models[0]; if (m) dispatch(openModal({ model: m })); setMobileOpen(false); }}
                    className="flex-1 bg-accent text-white text-[0.82rem] font-medium rounded-full py-2 hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
                  >
                    Try free →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
