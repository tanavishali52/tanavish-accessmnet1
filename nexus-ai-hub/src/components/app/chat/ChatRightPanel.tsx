'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { openApp } from '@/store/appSlice';
import { openModal } from '@/store/modalSlice';
import { FiExternalLink, FiZap, FiTrendingUp, FiBook, FiCode } from 'react-icons/fi';
import { motion } from 'framer-motion';
import type { Model } from '@/lib/api';
import { useTranslation } from 'react-i18next';

const getQuickActions = (t: any) => [
  { label: t('chat.right_panel.actions.marketplace'), tab: 'marketplace' as const },
  { label: t('chat.right_panel.actions.build_agent'), tab: 'agents' as const },
  { label: t('chat.right_panel.actions.research_feed'), tab: 'research' as const },
];

const getRefineItems = (t: any) => [
  { icon: '⚡', text: t('chat.right_panel.refine.faster_cheaper') },
  { icon: '🎯', text: t('chat.right_panel.refine.accuracy_quality') },
  { icon: '🔗', text: t('chat.right_panel.refine.api_integration') },
  { icon: '📈', text: t('chat.right_panel.refine.scale_production') },
];

export default function ChatRightPanel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currentModelId } = useSelector((s: RootState) => s.chat);
  const { items: catalog } = useSelector((s: RootState) => s.models);
  const currentModel = catalog.find((m) => m.id === currentModelId);

  const QUICK_ACTIONS = getQuickActions(t);
  const REFINE_ITEMS = getRefineItems(t);

  return (
    <div className="w-[272px] flex-shrink-0 bg-white border-l border-black/[0.08] overflow-y-auto flex flex-col">
      {/* Active model */}
      {currentModel && (
        <div className="p-4 border-b border-black/[0.08]">
          <div className="text-[0.68rem] text-text3 font-semibold uppercase tracking-[0.08em] mb-3">
            {t('chat.right_panel.active_model')}
          </div>
          <div className="bg-bg border border-black/[0.14] rounded-sm p-3.5" style={{ borderRadius: 12 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base flex-shrink-0" style={{ background: currentModel.bg }}>
                {currentModel.icon}
              </div>
              <div>
                <h4 className="text-[0.875rem] font-semibold font-syne text-text1">{currentModel.name}</h4>
                <small className="text-[0.7rem] text-text3">{currentModel.org}</small>
              </div>
            </div>
            <p className="text-[0.75rem] text-text2 leading-relaxed mb-3">{currentModel.desc.slice(0, 100)}...</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[
                { label: t('chat.right_panel.rating'), value: `${currentModel.rating}⭐` },
                { label: t('chat.right_panel.reviews'), value: `${(currentModel.reviews / 1000).toFixed(1)}k` },
                { label: t('chat.right_panel.price'), value: currentModel.price.split('/')[0] },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-black/[0.08] rounded text-center p-1.5">
                  <strong className="block text-[0.85rem] font-semibold text-text1">{s.value}</strong>
                  <span className="text-[0.62rem] text-text3">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => dispatch(openModal({ model: currentModel }))}
                className="flex-1 py-2 text-[0.75rem] font-medium rounded-lg border border-black/[0.14] text-text2 hover:border-blue hover:text-blue transition-all cursor-pointer bg-none"
              >
                {t('chat.right_panel.details')}
              </button>
              <button
                onClick={() => dispatch(openModal({ model: currentModel, tab: 'guide' }))}
                className="flex-1 py-2 text-[0.75rem] font-medium rounded-lg bg-accent-lt border border-accent/25 text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
              >
                {t('chat.right_panel.how_to_use')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="p-4 border-b border-black/[0.08]">
        <div className="text-[0.68rem] text-text3 font-semibold uppercase tracking-[0.08em] mb-3">
          {t('chat.right_panel.quick_actions')}
        </div>
        {QUICK_ACTIONS.map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ x: 2 }}
            onClick={() => dispatch(openApp(a.tab))}
            className="w-full text-left px-3 py-2.5 text-[0.8rem] text-text2 rounded-sm hover:bg-bg2 hover:text-text1 transition-all cursor-pointer border-none bg-none mb-1 font-instrument"
            style={{ borderRadius: 8 }}
          >
            {a.label}
          </motion.button>
        ))}
      </div>

      {/* Refine suggestions */}
      <div className="p-4 border-b border-black/[0.08]">
        <div className="text-[0.68rem] text-text3 font-semibold uppercase tracking-[0.08em] mb-3">
          {t('chat.right_panel.refine_setup')}
        </div>
        {REFINE_ITEMS.map((item) => (
          <motion.div
            key={item.text}
            whileHover={{ borderColor: '#C8622A', background: '#FDF1EB', color: '#C8622A' }}
            className="flex items-center gap-2 px-3 py-2.5 border border-black/[0.08] rounded-sm cursor-pointer text-[0.8rem] text-text2 transition-all mb-1.5"
            style={{ borderRadius: 8 }}
          >
            <span className="text-[0.9rem]">{item.icon}</span>
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Recent updates */}
      <div className="p-4">
        <div className="text-[0.68rem] text-text3 font-semibold uppercase tracking-[0.08em] mb-3">
          {t('chat.right_panel.latest_updates')}
        </div>
        {[
          { org: 'OpenAI', text: 'GPT-5.4 with native computer use', time: '2h ago' },
          { org: 'Anthropic', text: 'Claude 4.6 Opus with 1M context', time: '1d ago' },
          { org: 'Google', text: 'Gemini 3.1 Pro with 5M context', time: '3d ago' },
        ].map((u, i) => (
          <div key={i} className="border border-black/[0.08] rounded-sm p-2.5 mb-1.5 cursor-pointer hover:border-black/[0.14] hover:shadow-card transition-all" style={{ borderRadius: 8 }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[0.68rem] font-semibold text-accent bg-accent-lt px-1.5 py-0.5 rounded">{u.org}</span>
              <span className="text-[0.65rem] text-text3">{u.time}</span>
            </div>
            <div className="text-[0.75rem] text-text2 leading-snug">{u.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
