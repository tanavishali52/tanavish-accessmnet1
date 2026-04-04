'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import {
  setSearchQuery, setActiveFilter, setActiveLab,
  clearLabFilter, setPriceRange, setMinRating,
} from '@/store/modelsSlice';
import { openModal } from '@/store/modalSlice';
import { openApp, showToast } from '@/store/appSlice';
import ModelCard from '@/components/shared/ModelCard';
import Skeleton from '@/components/shared/Skeleton';
import { FiSearch, FiMic, FiPaperclip, FiFilter, FiX } from 'react-icons/fi';

interface TypeFilter {
  id: string;
  label: string;
  translationKey?: string;
}

function ModelCardSkeleton() {
  return (
    <div className="bg-white border border-black/[0.08] p-4 sm:p-6 shadow-card h-[160px] sm:h-[180px] flex flex-col" style={{ borderRadius: 20 }}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={44} height={44} borderRadius={11} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="0.9rem" />
          <Skeleton width="30%" height="0.7rem" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <Skeleton width="100%" height="0.75rem" />
        <Skeleton width="90%" height="0.75rem" />
      </div>
      <div className="pt-4 border-t border-black/[0.08] flex justify-between items-center mt-3">
        <Skeleton width={80} height="0.75rem" />
        <Skeleton width={40} height="0.75rem" />
      </div>
    </div>
  );
}

export default function MarketplaceView() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { searchQuery, activeFilter, activeLab, priceRange, minRating, items, labs, status } = useSelector((s: RootState) => s.models);
  const [showFilters, setShowFilters] = useState(false);

  const TYPE_FILTERS: TypeFilter[] = [
    { id: 'all',      label: t('marketplace.filters.all'), translationKey: 'marketplace.filters.all' },
    { id: 'language', label: t('marketplace.filters.language'), translationKey: 'marketplace.filters.language' },
    { id: 'vision',   label: t('marketplace.filters.vision'), translationKey: 'marketplace.filters.vision' },
    { id: 'code',     label: t('marketplace.filters.code'), translationKey: 'marketplace.filters.code' },
    { id: 'image',    label: t('marketplace.filters.image_gen'), translationKey: 'marketplace.filters.image_gen' },
    { id: 'audio',    label: t('marketplace.filters.audio'), translationKey: 'marketplace.filters.audio' },
    { id: 'open',     label: t('marketplace.filters.opensource'), translationKey: 'marketplace.filters.opensource' },
  ];

  const catalog = items;

  const filtered = useMemo(() => catalog.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.org.toLowerCase().includes(q);
    const matchType   = activeFilter === 'all' || m.types.includes(activeFilter);
    const matchLab    = activeLab === 'all' || m.lab === activeLab;
    const matchPrice  = m.price_start <= priceRange;
    const matchRating = minRating === 'any' || (minRating === '4+' && m.rating >= 4) || (minRating === '4.5+' && m.rating >= 4.5);
    return matchSearch && matchType && matchLab && matchPrice && matchRating;
  }), [catalog, searchQuery, activeFilter, activeLab, priceRange, minRating]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-white border-b border-black/[0.08] px-3 sm:px-6 py-3 sm:py-5 flex flex-col gap-3 flex-shrink-0">
        {/* Row 1: title + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-syne text-[1rem] sm:text-[1.1rem] font-bold text-text1 whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
            {t('marketplace.header')}
          </span>
          {/* Search */}
          <div className="flex-1 min-w-[160px] flex items-center bg-bg border border-black/[0.14] rounded-full focus-within:border-accent focus-within:bg-white transition-all overflow-hidden">
            <div className="pl-3 flex items-center text-text3 flex-shrink-0"><FiSearch size={13} /></div>
            <input
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search models..."
              className="flex-1 px-2 py-2 text-[0.8rem] bg-transparent border-none outline-none text-text1 font-instrument min-w-0"
            />
            <button onClick={() => dispatch(showToast('Voice search — coming soon'))}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-none text-text3 hover:bg-bg2 hover:text-text1 transition-all border-none cursor-pointer flex-shrink-0">
              <FiMic size={14} />
            </button>
            <button onClick={() => dispatch(showToast('File upload — coming soon'))}
              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center bg-none text-text3 hover:bg-bg2 hover:text-text1 transition-all border-none cursor-pointer flex-shrink-0">
              <FiPaperclip size={14} />
            </button>
          </div>
          {/* Mobile: filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-lg border text-[0.78rem] font-medium transition-all cursor-pointer font-instrument ${showFilters ? 'bg-accent border-accent text-white' : 'bg-none border-black/[0.14] text-text2'}`}
          >
            <FiFilter size={14} />
            Filters
          </button>
        </div>

        {/* Row 2: Type filter pills (hidden on mobile, shown in filter panel) */}
        <div className="hidden sm:flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button key={f.id} onClick={() => dispatch(setActiveFilter(f.id))}
              className={`px-3 py-1.5 text-[0.78rem] border rounded-full cursor-pointer transition-all font-instrument ${activeFilter === f.id ? 'bg-accent-lt border-accent text-accent' : 'bg-none border-black/[0.14] text-text2 hover:bg-accent-lt hover:border-accent hover:text-accent'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile filter panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="sm:hidden bg-white border-b border-black/[0.08] overflow-hidden flex-shrink-0"
          >
            <div className="p-3 space-y-3">
              {/* Type filters */}
              <div>
                <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-wider mb-1.5">Type</div>
                <div className="flex gap-1.5 flex-wrap">
                  {TYPE_FILTERS.map((f) => (
                    <button key={f.id} onClick={() => dispatch(setActiveFilter(f.id))}
                      className={`px-2.5 py-1 text-[0.72rem] border rounded-full cursor-pointer transition-all font-instrument ${activeFilter === f.id ? 'bg-accent-lt border-accent text-accent' : 'bg-none border-black/[0.14] text-text2'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price range */}
              <div>
                <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-wider mb-1">Price /1M tokens</div>
                <input type="range" min={0} max={100} value={priceRange}
                  onChange={(e) => dispatch(setPriceRange(Number(e.target.value)))}
                  className="w-full accent-accent" />
                <div className="text-[0.75rem] text-text2">Up to ${priceRange}</div>
              </div>
              {/* Min rating */}
              <div>
                <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-wider mb-1.5">Min Rating</div>
                <div className="flex gap-1.5">
                  {['any', '4+', '4.5+'].map((r) => (
                    <button key={r} onClick={() => dispatch(setMinRating(r))}
                      className={`px-2.5 py-1 text-[0.72rem] border rounded-full cursor-pointer transition-all font-instrument ${minRating === r ? 'bg-accent-lt border-accent text-accent' : 'bg-none border-black/[0.14] text-text2'}`}>
                      {r === 'any' ? 'Any' : `${r} ⭐`}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowFilters(false)}
                className="w-full py-2 bg-text1 text-white text-[0.82rem] font-medium rounded-full border-none cursor-pointer font-instrument">
                Apply Filters · {filtered.length} models
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Labs Bar ── */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-white border-b border-black/[0.08] overflow-x-auto flex-shrink-0 scrollbar-none">
        <span className="text-[0.62rem] sm:text-[0.67rem] font-bold uppercase tracking-[0.09em] text-text3 whitespace-nowrap flex-shrink-0 pr-1">
          🏛 Labs
        </span>
        <button onClick={() => dispatch(clearLabFilter())}
          className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 border-[1.5px] rounded-full text-[0.72rem] sm:text-[0.78rem] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0 transition-all font-instrument ${activeLab === 'all' ? 'bg-accent border-accent text-white' : 'bg-bg border-black/[0.14] text-text2 hover:bg-accent-lt hover:border-accent hover:text-accent'}`}>
          All
        </button>
        {labs.map((lab) => (
          <button key={lab.id} onClick={() => dispatch(setActiveLab(lab.id))}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 border-[1.5px] rounded-full text-[0.72rem] sm:text-[0.78rem] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0 transition-all font-instrument ${activeLab === lab.id ? 'bg-accent border-accent text-white shadow-[0_3px_12px_rgba(200,98,42,0.28)]' : 'bg-bg border-black/[0.14] text-text2 hover:bg-accent-lt hover:border-accent hover:text-accent'}`}>
            <span className="text-sm sm:text-base">{lab.icon}</span>
            <span className="hidden sm:inline">{lab.name}</span>
            <span className="sm:hidden">{lab.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Active lab banner */}
      <AnimatePresence>
        {activeLab !== 'all' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-accent-lt to-white/0 border-b border-accent/25 text-[0.78rem] sm:text-[0.8rem] text-accent font-medium flex-shrink-0">
            <span>{labs.find((l) => l.id === activeLab)?.icon}</span>
            <span>Showing <strong>{activeLab}</strong> models</span>
            <button onClick={() => dispatch(clearLabFilter())}
              className="ml-auto text-[0.72rem] text-accent2 bg-none border border-accent/25 rounded-full px-2.5 py-0.5 cursor-pointer hover:bg-accent hover:text-white transition-all font-instrument flex items-center gap-1">
              <FiX size={11} /> Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden sm:flex flex-col w-[200px] lg:w-[220px] flex-shrink-0 p-3 sm:p-4 border-r border-black/[0.08] bg-white overflow-y-auto">
          {/* AI Guide */}
          <div onClick={() => dispatch(openApp('chat'))}
            className="bg-accent-lt border border-accent/25 rounded-sm p-3 mb-3 cursor-pointer hover:bg-accent hover:text-white transition-all group"
            style={{ borderRadius: 12 }}>
            <div className="text-[0.75rem] font-semibold text-accent group-hover:text-white mb-0.5">✦ Need help choosing?</div>
            <div className="text-[0.68rem] text-text2 group-hover:text-white/80 leading-snug">Chat with our AI guide for personalised picks.</div>
          </div>
          {/* Price */}
          <div className="mb-4">
            <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-[0.06em] mb-1.5">Max Price /1M</div>
            <input type="range" min={0} max={100} value={priceRange}
              onChange={(e) => dispatch(setPriceRange(Number(e.target.value)))}
              className="w-full accent-accent" />
            <div className="text-[0.75rem] text-text2 mt-0.5">Up to ${priceRange}</div>
          </div>
          {/* Rating */}
          <div className="mb-4">
            <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-[0.06em] mb-1.5">Min Rating</div>
            <div className="flex gap-1 flex-wrap">
              {['any', '4+', '4.5+'].map((r) => (
                <button key={r} onClick={() => dispatch(setMinRating(r))}
                  className={`px-2 py-0.5 text-[0.68rem] border rounded-full cursor-pointer transition-all font-instrument ${minRating === r ? 'bg-accent-lt border-accent text-accent' : 'bg-none border-black/[0.14] text-text2 hover:bg-accent-lt hover:border-accent hover:text-accent'}`}>
                  {r === 'any' ? 'Any' : `${r} ⭐`}
                </button>
              ))}
            </div>
          </div>
          {/* Quick Guides */}
          <div>
            <div className="text-[0.68rem] font-semibold text-text3 uppercase tracking-[0.06em] mb-1.5">Quick Guides</div>
            <div className="flex flex-col gap-1">
              {[
                { label: '📐 Prompt tips', tab: 'prompt' as const },
                { label: '🤖 Agent guide', tab: 'agent' as const },
                { label: '💰 Pricing',     tab: 'pricing' as const },
              ].map((g) => (
                <button key={g.label}
                  onClick={() => { const m = items[0]; if (m) dispatch(openModal({ model: m, tab: g.tab })); }}
                  className="text-left px-2.5 py-1.5 border border-black/[0.08] rounded-lg text-[0.72rem] text-text2 cursor-pointer transition-all hover:text-accent hover:border-accent/40 font-instrument">
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          className="flex-1 p-3 sm:p-5 overflow-y-auto"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '0.75rem', alignContent: 'start' }}
        >
          {/* Result count */}
          <div className="col-span-full text-[0.75rem] text-text3 pb-1">
            {filtered.length} model{filtered.length !== 1 ? 's' : ''} found
          </div>

          {status === 'loading' ? (
            Array.from({ length: 9 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-text3">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-base font-medium">No models found</div>
              <div className="text-sm mt-1">Try adjusting your filters</div>
            </div>
          ) : (
            filtered.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.35) }}
              >
                <ModelCard model={model} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
