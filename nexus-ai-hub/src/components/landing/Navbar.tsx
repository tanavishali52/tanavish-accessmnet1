'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { goHome } from '@/store/appSlice';
import { FiZap, FiMenu, FiX, FiMessageSquare, FiShoppingBag, FiCpu, FiBookOpen } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const getNavLinks = (t: any) => [
  { label: t('common.chat_hub'), href: '/chat', icon: <FiMessageSquare size={15} /> },
  { label: t('common.marketplace'), href: '/marketplace', icon: <FiShoppingBag size={15} /> },
  { label: t('common.discover_new'), href: '/research', icon: <FiBookOpen size={15} /> },
  { label: t('common.agents'), href: '/agents', icon: <FiCpu size={15} /> },
];

export default function Navbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const NAV_LINKS = getNavLinks(t);

  return (
    <nav className="sticky top-0 z-[200] flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4 bg-bg/92 backdrop-blur-md border-b border-black/[0.08]">
      {/* Logo */}
      <button
        onClick={() => { dispatch(goHome()); router.push('/'); }}
        className="flex items-center gap-2 font-syne text-[1.1rem] sm:text-[1.4rem] font-bold text-text1 cursor-pointer flex-shrink-0"
        style={{ letterSpacing: '-0.03em' }}
      >
        <div className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] bg-accent rounded-[6px] flex items-center justify-center flex-shrink-0">
          <FiZap size={13} className="text-white" />
        </div>
        {t('common.go_home')}
      </button>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-6 lg:gap-7 list-none">
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <button
              onClick={() => router.push(l.href)}
              className="text-[0.85rem] text-text2 hover:text-text1 transition-colors cursor-pointer bg-none border-none font-instrument flex items-center gap-1.5"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-3">
        <LanguageSwitcher />
        <button
          onClick={() => router.push('/login?next=/chat')}
          className="border border-black/[0.14] text-text1 bg-none text-[0.85rem] font-medium rounded-full px-5 py-2 hover:border-accent hover:text-accent transition-all cursor-pointer font-instrument"
        >
          {t('common.sign_in')}
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/chat')}
          className="bg-accent text-white text-[0.85rem] font-medium rounded-full px-5 py-2 hover:bg-accent2 transition-colors cursor-pointer font-instrument border-none"
        >
          {t('common.get_started')}
        </motion.button>
      </div>

      {/* Mobile: CTA + Hamburger */}
      <div className="flex md:hidden items-center gap-2">
        <LanguageSwitcher />
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/chat')}
          className="bg-accent text-white text-[0.75rem] font-medium rounded-full px-3.5 py-1.5 hover:bg-accent2 transition-colors cursor-pointer font-instrument border-none"
        >
          {t('common.start')}
        </motion.button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center text-text1 border border-black/[0.14] rounded-lg hover:bg-bg2 transition-colors"
        >
          {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-black/[0.08] overflow-hidden md:hidden z-50"
          >
            <div className="p-4 grid grid-cols-2 gap-2">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => { router.push(l.href); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[0.85rem] text-text2 hover:bg-accent-lt hover:text-accent transition-all border border-black/[0.08] font-instrument"
                  style={{ borderRadius: 10 }}
                >
                  {l.icon} {l.label}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 pt-0 flex gap-2">
              <button
                onClick={() => { router.push('/login?next=/chat'); setMobileOpen(false); }}
                className="flex-1 border border-black/[0.14] text-text1 text-[0.85rem] font-medium rounded-full py-2.5 hover:border-accent hover:text-accent transition-all cursor-pointer font-instrument"
              >
                {t('common.sign_in')}
              </button>
              <button
                onClick={() => { router.push('/chat'); setMobileOpen(false); }}
                className="flex-1 bg-accent text-white text-[0.85rem] font-medium rounded-full py-2.5 hover:bg-accent2 transition-colors cursor-pointer font-instrument border-none"
              >
                {t('common.get_started')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
