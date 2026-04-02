'use client';

import { useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function LocalizationProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateAttributes = () => {
      const lang = i18n.language || 'en';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    };

    updateAttributes();
    i18n.on('languageChanged', updateAttributes);

    return () => {
      i18n.off('languageChanged', updateAttributes);
    };
  }, [i18n]);

  return <>{children}</>;
}
