'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { goHome } from '@/store/appSlice';
import { FiZap, FiMenu, FiX, FiMessageSquare, FiShoppingBag, FiCpu, FiBookOpen } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const getNavLinks = (t: any) => [
  { label: t('common.chat_hub'), href: '/chat', icon: <FiMessageSquare size={18} strokeWidth={2} /> },
  { label: t('common.marketplace'), href: '/marketplace', icon: <FiShoppingBag size={18} strokeWidth={2} /> },
  { label: t('common.discover_new'), href: '/research', icon: <FiBookOpen size={18} strokeWidth={2} /> },
  { label: t('common.agents'), href: '/agents', icon: <FiCpu size={18} strokeWidth={2} /> },
];

export default function Navbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const NAV_LINKS = getNavLinks(t);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="relative z-[200] flex h-auto shrink-0 flex-col md:sticky md:top-0 md:h-[100dvh] md:w-[260px] lg:w-[272px] md:shrink-0 md:overflow-y-auto md:border-r md:border-black/[0.08] md:bg-white">
      {/* Mobile top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/[0.08] bg-white px-3 md:hidden">
        <button
          type="button"
          onClick={() => {
            dispatch(goHome());
            router.push('/');
            closeMobile();
          }}
          className="flex min-w-0 cursor-pointer items-center gap-2 border-none bg-transparent font-syne text-[1.05rem] font-bold text-text1"
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.14] text-text1 hover:bg-bg2"
          aria-label="Open menu"
        >
          <FiMenu size={18} />
        </button>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[210] bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-[220] flex h-[100dvh] w-[min(300px,calc(100vw-2rem))] max-w-full flex-col border-r border-black/[0.08] bg-white shadow-[8px_0_32px_-12px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out overscroll-y-contain touch-pan-y md:relative md:z-auto md:h-full md:w-full md:max-h-none md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/[0.08] px-3 py-3 md:hidden">
          <span className="font-syne text-[0.92rem] font-bold text-text1">{t('common.go_home')}</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.1] hover:bg-bg2"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="hidden border-b border-black/[0.08] px-4 py-5 md:block">
          <button
            type="button"
            onClick={() => {
              dispatch(goHome());
              router.push('/');
            }}
            className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent text-left font-syne text-[1.2rem] font-bold text-text1"
            style={{ letterSpacing: '-0.03em' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
              <FiZap size={15} className="text-white" />
            </div>
            {t('common.go_home')}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3 md:px-3 md:py-4" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              type="button"
              onClick={() => {
                router.push(l.href);
                closeMobile();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.84rem] font-semibold text-text2 transition-all hover:bg-bg2 hover:text-text1 md:text-[0.86rem] border-none cursor-pointer font-instrument"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-bg2/80 text-text1">
                {l.icon}
              </span>
              <span className="min-w-0 leading-snug">{l.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-black/[0.08] bg-gradient-to-t from-bg2/30 to-white px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom,0px))] md:p-3">
          <LanguageSwitcher variant="sidebar" />
          <button
            type="button"
            onClick={() => {
              router.push('/login?next=/chat');
              closeMobile();
            }}
            className="w-full cursor-pointer rounded-xl border border-black/[0.14] py-2.5 text-[0.8rem] font-semibold text-text1 transition-all font-instrument hover:border-accent hover:text-accent"
          >
            {t('common.sign_in')}
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              router.push('/chat');
              closeMobile();
            }}
            className="w-full cursor-pointer rounded-xl border-none bg-accent py-2.5 text-[0.8rem] font-semibold text-white font-instrument hover:bg-accent2"
          >
            {t('common.get_started')}
          </motion.button>
        </div>
      </aside>
    </div>
  );
}
