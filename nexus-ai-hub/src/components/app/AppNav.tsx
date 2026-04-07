'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { goHome, ActiveTab } from '@/store/appSlice';
import { logout } from '@/store/authSlice';
import { openModal } from '@/store/modalSlice';
import { motion } from 'framer-motion';
import {
  FiZap,
  FiMessageSquare,
  FiShoppingBag,
  FiCpu,
  FiBookOpen,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronsLeft,
  FiChevronsRight,
  FiLogIn,
} from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { apiLogout } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const getTabs = (t: any): { id: ActiveTab; label: string; icon: React.ReactNode }[] => [
  { id: 'chat', label: t('common.chat_hub'), icon: <FiMessageSquare size={18} strokeWidth={2} /> },
  { id: 'marketplace', label: t('common.marketplace'), icon: <FiShoppingBag size={18} strokeWidth={2} /> },
  { id: 'agents', label: t('common.agents'), icon: <FiCpu size={18} strokeWidth={2} /> },
  { id: 'research', label: t('common.discover_new'), icon: <FiBookOpen size={18} strokeWidth={2} /> },
];

const TAB_ROUTES: Record<ActiveTab, string> = {
  chat: '/chat',
  marketplace: '/marketplace',
  agents: '/agents',
  research: '/research',
};

export default function AppNav() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const activeTab = useSelector((s: RootState) => s.app.activeTab);
  const { items: models, status: modelsStatus } = useSelector((s: RootState) => s.models);
  const catalogPending =
    modelsStatus === 'loading' || (modelsStatus === 'idle' && models.length === 0);
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathOnMount = useRef<string | null>(null);

  const TABS = getTabs(t);
  const pathTab = TABS.find((tab) => {
    if (tab.id === 'research' && pathname.startsWith('/research')) return true;
    if (tab.id === 'chat' && (pathname === '/chat' || pathname === '/chathub')) return true;
    return pathname === TAB_ROUTES[tab.id];
  })?.id;
  const selectedTab = pathTab ?? activeTab;

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
    if (pathOnMount.current === null) {
      pathOnMount.current = pathname;
      return;
    }
    if (pathOnMount.current !== pathname) {
      setSidebarCollapsed(true);
      pathOnMount.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    dispatch(logout());
    router.push('/');
    closeMobile();
  };

  const col = sidebarCollapsed;

  return (
    <div
      className={`relative z-[100] flex h-auto min-h-0 shrink-0 flex-col border-black/[0.08] transition-[width] duration-200 ease-out md:h-full md:border-r ${
        col ? 'md:bg-[linear-gradient(180deg,#1F2937_0%,#111827_100%)]' : 'md:bg-white'
      } ${
        col ? 'md:w-[76px]' : 'md:w-[260px] lg:w-[272px]'
      }`}
    >
      {/* Mobile top bar */}
      <div className="flex min-h-14 shrink-0 items-center justify-between border-b border-black/[0.08] bg-white px-3 pt-[max(0.25rem,env(safe-area-inset-top,0px))] pb-2 md:hidden">
        <button
          type="button"
          onClick={() => {
            dispatch(goHome());
            router.push('/');
            closeMobile();
          }}
          className="flex min-w-0 cursor-pointer items-center gap-2 border-none bg-transparent font-syne text-[1rem] font-bold text-text1"
          style={{ letterSpacing: '-0.03em' }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
            <FiZap size={14} className="text-white" />
          </div>
          <span className="truncate">{t('common.go_home')}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.14] text-text2 transition-colors hover:bg-bg2"
          aria-label="Open menu"
        >
          <FiMenu size={18} />
        </button>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[110] bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-[120] flex h-[100dvh] w-[min(300px,calc(100vw-2rem))] max-w-full flex-col border-r border-black/[0.08] bg-white shadow-[8px_0_32px_-12px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out overscroll-y-contain touch-pan-y md:relative md:z-0 md:h-full md:w-full md:max-h-none md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/[0.08] px-3 py-3 md:hidden">
          <span className="font-syne text-[0.92rem] font-bold text-text1">{t('common.go_home')}</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.1] text-text2 hover:bg-bg2"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Logo + collapse toggle (desktop) */}
        <div className="hidden border-b border-black/[0.08] md:block">
          {col ? (
            <div className="flex flex-col items-center gap-3 px-2 py-4">
              <button
                type="button"
                onClick={() => {
                  dispatch(goHome());
                  router.push('/');
                }}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-accent"
                title={t('common.go_home')}
                aria-label={t('common.go_home')}
              >
                <FiZap size={15} className="text-white" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-black/[0.1] text-text2 transition-colors hover:border-accent hover:text-accent"
                title={t('common.expand_sidebar')}
                aria-label={t('common.expand_sidebar')}
              >
                <FiChevronsRight size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-4">
              <button
                type="button"
                onClick={() => {
                  dispatch(goHome());
                  router.push('/');
                }}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent text-left font-syne text-[1.05rem] font-bold text-text1 lg:text-[1.15rem]"
                style={{ letterSpacing: '-0.03em' }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <FiZap size={15} className="text-white" />
                </div>
                <span className="truncate">{t('common.go_home')}</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-black/[0.1] text-text2 transition-colors hover:border-accent hover:text-accent"
                title={t('common.collapse_sidebar')}
                aria-label={t('common.collapse_sidebar')}
              >
                <FiChevronsLeft size={18} />
              </button>
            </div>
          )}
        </div>

        <nav
          className={`flex flex-1 flex-col gap-1 overflow-y-auto py-3 md:py-4 ${col ? 'md:items-center md:px-1' : 'px-2 md:px-3'}`}
          aria-label="Main"
        >
          {TABS.map((tab) => {
            const active = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                title={tab.label}
                onClick={() => {
                  router.push(TAB_ROUTES[tab.id]);
                  closeMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.84rem] font-semibold transition-all md:text-[0.86rem] ${
                  col ? 'md:justify-center md:px-0 md:py-2' : ''
                } ${
                  active
                    ? 'bg-accent-lt text-accent shadow-[inset_0_0_0_1px_rgba(200,98,42,0.2)]'
                    : 'text-text2 hover:bg-bg2 hover:text-text1'
                } cursor-pointer border-none font-instrument`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    active ? 'border-accent/25 bg-white text-accent' : 'border-black/[0.06] bg-bg2/80 text-text1'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className={`min-w-0 leading-snug ${col ? 'md:hidden' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className={`mt-auto space-y-2 border-t border-black/[0.08] bg-gradient-to-t from-bg2/30 to-white px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom,0px))] md:space-y-2 md:px-3 md:pb-3 ${
            col
              ? 'md:flex md:flex-col md:items-center md:px-2 md:pb-[max(12px,env(safe-area-inset-bottom,0px))] md:bg-[linear-gradient(180deg,#1F2937_0%,#111827_100%)]'
              : ''
          }`}
        >
          {col ? (
            <>
              <div className="hidden md:flex md:w-full md:justify-center">
                <LanguageSwitcher variant="sidebar-icon" />
              </div>
              <div className="md:hidden">
                <LanguageSwitcher variant="sidebar" />
              </div>
            </>
          ) : (
            <LanguageSwitcher variant="sidebar" />
          )}

          {isAuthenticated && user ? (
            <div className={`space-y-2 ${col ? 'md:flex md:w-full md:flex-col md:items-center md:gap-2 md:space-y-0' : ''}`}>
              <div
                className={`flex items-center gap-2 rounded-xl border border-black/[0.1] bg-white px-3 py-2 ${col ? 'md:w-auto md:justify-center md:border-0 md:bg-transparent md:p-0' : ''}`}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[0.7rem] font-bold text-white"
                  title={user.name}
                >
                  {user.avatar ?? user.name[0]?.toUpperCase()}
                </div>
                <span className={`min-w-0 truncate text-[0.78rem] font-medium text-text1 font-instrument ${col ? 'md:hidden' : ''}`}>
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title={t('common.sign_in').includes('Sign') ? 'Sign out' : 'لاگ آؤٹ'}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/[0.12] py-2.5 text-[0.8rem] text-text2 transition-all font-instrument hover:border-red-300 hover:text-red-600 ${col ? 'md:h-10 md:w-10 md:border-0 md:p-0 md:text-red-600 hover:md:bg-rose/10' : ''}`}
              >
                <FiLogOut size={18} />
                <span className={col ? 'md:hidden' : ''}>
                  {t('common.sign_in').includes('Sign') ? 'Sign out' : 'لاگ آؤٹ'}
                </span>
              </button>
            </div>
          ) : (
            <div className={`flex flex-col gap-2 ${col ? 'md:items-center' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  router.push('/login?next=/chat');
                  closeMobile();
                }}
                title={t('common.sign_in')}
                className={`w-full cursor-pointer rounded-xl border border-black/[0.14] py-2.5 text-[0.8rem] font-semibold text-text1 transition-all font-instrument hover:border-accent hover:text-accent ${col ? 'md:flex md:h-10 md:w-10 md:items-center md:justify-center md:border-black/[0.12] md:p-0' : ''}`}
              >
                <span className={col ? 'md:hidden' : ''}>{t('common.sign_in')}</span>
                <FiLogIn size={18} className={col ? 'hidden md:block' : 'hidden'} aria-hidden />
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: catalogPending ? 1 : 1.02 }}
                whileTap={{ scale: catalogPending ? 1 : 0.98 }}
                onClick={() => {
                  if (catalogPending) return;
                  const m = models.find((m) => m.id === 'gpt5') || models[0];
                  if (m) dispatch(openModal({ model: m }));
                  closeMobile();
                }}
                disabled={catalogPending}
                title={t('common.get_started')}
                className={`w-full rounded-xl border-none py-2.5 text-[0.8rem] font-semibold font-instrument transition-colors ${
                  catalogPending
                    ? 'cursor-wait bg-black/[0.12] text-text3'
                    : 'cursor-pointer bg-accent text-white hover:bg-accent2'
                } ${col ? 'md:flex md:h-10 md:w-10 md:items-center md:justify-center md:p-0' : ''}`}
              >
                <span className={col ? 'md:hidden' : ''}>{t('common.get_started')}</span>
                <FiZap size={18} className={col ? 'hidden text-white md:block' : 'hidden'} aria-hidden />
              </motion.button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
