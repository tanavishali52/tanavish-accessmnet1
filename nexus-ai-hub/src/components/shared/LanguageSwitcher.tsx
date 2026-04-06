'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';
import '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

export default function LanguageSwitcher({
  variant = 'header',
}: {
  variant?: 'header' | 'sidebar' | 'sidebar-icon';
}) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebar = variant === 'sidebar';
  const sidebarIcon = variant === 'sidebar-icon';

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const toggleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    // Force a direction change on the html tag for RTL support
    document.documentElement.dir = code === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`relative ${sidebar || sidebarIcon ? (sidebarIcon ? 'flex justify-center' : 'w-full') : ''}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={currentLanguage.name}
        aria-label={currentLanguage.name}
        className={
          sidebarIcon
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.1] bg-bg2/50 text-text2 transition-all hover:border-accent/30 hover:text-accent group'
            : sidebar
              ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-black/[0.1] bg-bg2/50 px-3 py-2.5 transition-all hover:border-accent/30 group'
              : 'flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] hover:border-accent/30 transition-all bg-white/50 backdrop-blur-sm group'
        }
      >
        <FiGlobe size={sidebarIcon ? 18 : 14} className="text-text2 group-hover:text-accent transition-colors shrink-0" />
        {!sidebarIcon && (
          <>
            <span className="text-[0.8rem] font-medium text-text1 font-instrument uppercase truncate">
              {currentLanguage.code}
            </span>
            <FiChevronDown
              size={12}
              className={`text-text2 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>
      {sidebarIcon && (
        <span className="sr-only">
          {currentLanguage.name}, change language
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: sidebar || sidebarIcon ? 10 : 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={
              sidebarIcon
                ? 'absolute left-full bottom-0 ml-2 w-36 bg-white border border-black/[0.08] rounded-xl shadow-xl overflow-hidden z-[300]'
                : sidebar
                  ? 'absolute bottom-full left-0 right-0 mb-2 w-full bg-white border border-black/[0.08] rounded-xl shadow-xl overflow-hidden z-[300]'
                  : 'absolute top-full mt-2 right-0 w-36 bg-white border border-black/[0.08] rounded-xl shadow-xl overflow-hidden z-[300]'
            }
          >
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[0.85rem] font-instrument transition-colors ${
                    i18n.language === lang.code 
                      ? 'bg-accent/5 text-accent active' 
                      : 'text-text2 hover:bg-black/[0.02] hover:text-text1'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[1rem]">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && <FiCheck size={14} className="text-accent" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
