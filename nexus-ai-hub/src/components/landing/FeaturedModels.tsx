'use client';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { openApp } from '@/store/appSlice';
import ModelCard from '@/components/shared/ModelCard';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import { ModelCardSkeleton, LabTileSkeleton } from '@/components/shared/catalogSkeletons';
import { FiStar } from 'react-icons/fi';

export default function FeaturedModels() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, labs, status } = useSelector((s: RootState) => s.models);
  const featured = items.slice(0, 3);
  const catalogPending = status === 'loading' || (status === 'idle' && items.length === 0);

  return (
    <>
      {/* ── Featured Models ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 md:px-10">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <h2 className="font-syne text-[1.4rem] sm:text-[1.9rem] font-bold text-text1" style={{ letterSpacing: '-0.03em' }}>
            {t('landing.featured_title')}
          </h2>
          <button
            onClick={() => dispatch(openApp('marketplace'))}
            className="text-[0.82rem] sm:text-[0.85rem] text-accent font-medium cursor-pointer hover:underline font-instrument"
          >
            {t('landing.featured_view_all')}
          </button>
        </div>
        {/* Responsive: 1 col on mobile → 2 on sm → 3 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {catalogPending ? (
            [0, 1, 2].map((i) => <ModelCardSkeleton key={i} />)
          ) : status === 'error' ? (
            <div className="col-span-full text-center py-10 text-[0.9rem] text-text2">
              Models are temporarily unavailable. Open the marketplace from the app after signing in.
            </div>
          ) : (
            featured.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <ModelCard model={model} />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ── AI Labs Grid ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-8 md:px-10 bg-white">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <h2 className="font-syne text-[1.4rem] sm:text-[1.9rem] font-bold text-text1" style={{ letterSpacing: '-0.03em' }}>
              {t('landing.labs_title')}
            </h2>
            <p className="text-[0.82rem] sm:text-[0.85rem] text-text2 mt-1">{t('landing.labs_subtitle')}</p>
          </div>
          <button
            onClick={() => dispatch(openApp('marketplace'))}
            className="text-[0.82rem] sm:text-[0.85rem] text-accent font-medium cursor-pointer hover:underline font-instrument"
          >
            {t('landing.labs_explore')}
          </button>
        </div>
        {/* Responsive: 2 col → 3 → 4 → 6 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {catalogPending ? (
            Array.from({ length: 6 }).map((_, i) => <LabTileSkeleton key={i} />)
          ) : status === 'error' ? (
            <div className="col-span-full text-center py-8 text-[0.9rem] text-text2">Labs could not be loaded.</div>
          ) : (
            labs.map((lab, i) => (
              <motion.button
                key={lab.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(200,98,42,0.12)' }}
                onClick={() => dispatch(openApp('marketplace'))}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-black/[0.08] rounded-lg cursor-pointer text-left shadow-card hover:border-accent/40 transition-all"
                style={{ borderRadius: 12 }}
              >
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[10px] flex items-center justify-center flex-shrink-0 text-text1"
                  style={{ background: lab.color }}
                >
                  <CatalogIcon name={lab.icon} size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[0.78rem] sm:text-sm text-text1 truncate">{lab.name}</div>
                  <div className="text-[0.65rem] sm:text-[0.7rem] text-text3">{lab.count} models</div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="py-14 sm:py-20 px-4 sm:px-8 md:px-10 text-center"
        style={{ background: 'linear-gradient(135deg, #FDF1EB 0%, rgba(200,98,42,0.04) 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg sm:max-w-xl mx-auto"
        >
          <div className="flex justify-center mb-3 sm:mb-4 text-accent">
            <FiStar size={40} strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="font-syne text-[1.6rem] sm:text-[2.2rem] font-bold text-text1 mb-3 sm:mb-4" style={{ letterSpacing: '-0.03em' }}>
            {t('landing.banner_find')}
          </h2>
          <p className="text-[0.85rem] sm:text-base text-text2 mb-6 sm:mb-8 px-4 sm:px-0">
            {t('landing.banner_questions')}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => dispatch(openApp('chat'))}
            className="bg-accent text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-[0.875rem] sm:text-[0.95rem] hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
          >
            {t('landing.banner_cta')}
          </motion.button>
        </motion.div>
      </section>
    </>
  );
}
