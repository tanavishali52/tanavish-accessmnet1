'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  addMessage, setOnboardPhase, setObDone,
  setUserGoal, setUserAudience, setUserLevel, setUserBudget, setPendingRecs, setIsTyping,
} from '@/store/chatSlice';
import { openModal } from '@/store/modalSlice';
import { apiChatMessage, Model } from '@/lib/api';
import { useTranslation } from 'react-i18next';

const getGoalTiles = (t: any) => [
  { icon: '💬', label: t('chat.area.goals.chat'), value: 'Chat & Assistants' },
  { icon: '💻', label: t('chat.area.goals.code'), value: 'Code & Dev' },
  { icon: '🖼', label: t('chat.area.goals.image'), value: 'Image Generation' },
  { icon: '📊', label: t('chat.area.goals.data'), value: 'Data Analysis' },
  { icon: '✍️', label: t('chat.area.goals.writing'), value: 'Content Writing' },
  { icon: '🤖', label: t('chat.area.goals.agents'), value: 'AI Agents' },
];

const getOnboardQuestions = (t: any) => [
  {
    phase: 'audience',
    title: t('chat.onboarding.audience.title'),
    opts: [
      { icon: '👤', label: t('chat.area.onboarding.audience.personal') },
      { icon: '🏢', label: t('chat.area.onboarding.audience.business') },
      { icon: '🏭', label: t('chat.area.onboarding.audience.enterprise') },
      { icon: '🔬', label: t('chat.area.onboarding.audience.academic') },
    ],
  },
  {
    phase: 'level',
    title: t('chat.onboarding.level.title'),
    opts: [
      { icon: '🌱', label: t('chat.area.onboarding.level.beginner') },
      { icon: '📚', label: t('chat.area.onboarding.level.experience') },
      { icon: '⚡', label: t('chat.area.onboarding.level.intermediate') },
      { icon: '🚀', label: t('chat.area.onboarding.level.expert') },
    ],
  },
  {
    phase: 'budget',
    title: t('chat.onboarding.budget.title'),
    opts: [
      { icon: '🆓', label: t('chat.area.onboarding.budget.free') },
      { icon: '💵', label: t('chat.area.onboarding.budget.under50') },
      { icon: '💰', label: t('chat.area.onboarding.budget.under500') },
      { icon: '🏦', label: t('chat.area.onboarding.budget.over500') },
    ],
  },
];

export default function ChatArea() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { messages, onboardPhase, obDone, isTyping, userGoal } = useSelector((s: RootState) => s.chat);
  const { items: catalog } = useSelector((s: RootState) => s.models);
  const bottomRef = useRef<HTMLDivElement>(null);

  const GOAL_TILES = getGoalTiles(t);
  const ONBOARD_QUESTIONS = getOnboardQuestions(t);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // AI Response generator with translations
  const getAiReplyLocal = (txt: string, catalog: Model[]): { text: string; recs?: Model[] } => {
    const textLow = txt.toLowerCase();
    if (textLow.includes('code') || textLow.includes('coding') || textLow.includes('programming'))
      return { text: t('chat.sidebar.loading'), recs: catalog.filter((m) => m.types.includes('code')).slice(0, 3) };
    // ... Simplified for refactoring purposes, assuming apiChatMessage handles the actual complex logic
    return { text: `Results for "${txt}":`, recs: catalog.slice(0, 3) };
  };

  const handleGoalPick = (value: string) => {
    dispatch(setUserGoal(value));
    dispatch(setOnboardPhase('goal'));
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: value, timestamp: Date.now() }));
    setTimeout(() => {
      dispatch(addMessage({
        id: (Date.now() + 1).toString(), role: 'ai',
        content: t('chat.area.onboarding.audience.title'),
        timestamp: Date.now() + 1,
      }));
      dispatch(setOnboardPhase('audience'));
    }, 600);
  };

  const handleOnboardPick = async (phase: string, value: string) => {
    if (phase === 'audience') dispatch(setUserAudience(value));
    if (phase === 'level')    dispatch(setUserLevel(value));
    if (phase === 'budget')   dispatch(setUserBudget(value));
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: value, timestamp: Date.now() }));

    if (phase === 'audience') {
      setTimeout(() => {
        dispatch(addMessage({ id: (Date.now() + 1).toString(), role: 'ai', content: t('chat.area.onboarding.level.title'), timestamp: Date.now() + 1 }));
        dispatch(setOnboardPhase('level'));
      }, 600);
    } else if (phase === 'level') {
      setTimeout(() => {
        dispatch(addMessage({ id: (Date.now() + 1).toString(), role: 'ai', content: t('chat.area.onboarding.budget.title'), timestamp: Date.now() + 1 }));
        dispatch(setOnboardPhase('budget'));
      }, 600);
    } else if (phase === 'budget') {
      dispatch(setIsTyping(true));
      try {
        const { text: aiText, recs: rawRecs } = await apiChatMessage(userGoal || 'AI assistant', {
          goal: userGoal || undefined,
          budget: value,
        });
        const recs = (rawRecs as Model[]).map((r) => catalog.find((m) => m.id === r.id) ?? r);
        dispatch(setPendingRecs(recs as Model[]));
        dispatch(setIsTyping(false));
        dispatch(addMessage({
          id: (Date.now() + 1).toString(), role: 'ai',
          content: aiText,
          recs: recs as Model[],
          timestamp: Date.now() + 1,
        }));
      } catch {
        const recs = catalog.filter((m) => {
          if (value === t('chat.area.onboarding.budget.free')) return m.price_start === 0;
          if (value === t('chat.area.onboarding.budget.under50')) return m.price_start < 5;
          return true;
        }).slice(0, 3);
        dispatch(setPendingRecs(recs));
        dispatch(setIsTyping(false));
        dispatch(addMessage({
          id: (Date.now() + 1).toString(), role: 'ai',
          content: t('chat.area.onboarding.completion'),
          recs, timestamp: Date.now() + 1,
        }));
      }
      dispatch(setOnboardPhase('chat'));
      dispatch(setObDone(true));
    }
  };

  const showGreeting  = messages.length === 0 && !obDone;
  const showGoalTiles = onboardPhase === 'start' && showGreeting;

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4 items-start bg-bg">
      {/* Greeting card */}
      {showGreeting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/[0.08] w-full max-w-full sm:max-w-[600px] mx-auto shadow-md p-5 sm:p-8"
          style={{ borderRadius: 24 }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-lt to-accent/15 border-2 border-accent/25 rounded-full flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 animate-pulse">
            ✦
          </div>
          <h3 className="font-syne text-[1.1rem] sm:text-[1.3rem] font-bold text-text1 text-center mb-2" style={{ letterSpacing: '-0.02em' }}>
            {t('chat.area.welcome_title')}
          </h3>
          <p className="text-[0.8rem] sm:text-[0.875rem] text-text2 text-center mb-5 sm:mb-6 leading-relaxed">
            {t('chat.area.welcome_subtitle')}
          </p>
          {showGoalTiles && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOAL_TILES.map((tile) => (
                <motion.button
                  key={tile.label}
                  whileHover={{ scale: 1.02, backgroundColor: '#FDF1EB' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleGoalPick(tile.label)}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 border border-black/[0.14] rounded-sm cursor-pointer transition-all bg-bg hover:border-accent"
                  style={{ borderRadius: 12 }}
                >
                  <span className="text-xl sm:text-2xl">{tile.icon}</span>
                  <span className="text-[0.72rem] sm:text-xs font-medium text-text2 text-center leading-tight">{tile.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 sm:gap-2.5 max-w-full sm:max-w-[680px] w-full ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5 ${
              msg.role === 'user' ? 'bg-accent text-white' : 'bg-accent-lt text-accent border border-accent/25 text-base'
            }`}>
              {msg.role === 'user' ? 'U' : '✦'}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[0.82rem] sm:text-[0.875rem] leading-[1.65] break-words ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-lg rounded-br-sm'
                    : 'bg-white border border-black/[0.08] rounded-lg rounded-bl-sm text-text1'
                }`}
                style={{ borderRadius: 12 }}
              >
                {msg.content}
              </div>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className={`mt-1.5 flex flex-wrap gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.attachments.map((file) => (
                    <div
                      key={file.id}
                      className={`px-2.5 py-1.5 rounded-full text-[0.68rem] font-instrument border ${
                        msg.role === 'user'
                          ? 'bg-white/15 border-white/25 text-white'
                          : 'bg-bg border-black/[0.12] text-text2'
                      }`}
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              {/* Recs */}
              {msg.recs && msg.recs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-full sm:max-w-[520px]">
                  {msg.recs.map((rec) => (
                    <motion.div
                      key={rec.id}
                      whileHover={{ borderColor: '#C8622A', background: '#FDF1EB' }}
                      className="bg-bg border border-black/[0.14] rounded-sm p-3 cursor-pointer flex items-center gap-2 transition-all"
                      style={{ borderRadius: 12 }}
                      onClick={() => dispatch(openModal({ model: rec }))}
                    >
                      <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base flex-shrink-0" style={{ background: rec.bg }}>
                        {rec.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.8rem] font-medium text-text1 truncate">{rec.name}</div>
                        <div className="text-[0.68rem] text-text3">{rec.org}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Onboarding option tiles */}
      {(onboardPhase === 'audience' || onboardPhase === 'level' || onboardPhase === 'budget') && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2 max-w-full sm:max-w-[520px] w-full self-start mt-1"
        >
          {ONBOARD_QUESTIONS.find((q) => q.phase === onboardPhase)?.opts.map((opt) => (
            <motion.button
              key={opt.label}
              whileHover={{ background: '#FDF1EB', borderColor: '#C8622A', color: '#C8622A' }}
              onClick={() => handleOnboardPick(onboardPhase, opt.label)}
              className="flex items-center gap-2 px-3 py-2.5 border-[1.5px] border-black/[0.14] rounded-sm cursor-pointer bg-bg text-[0.78rem] sm:text-[0.8rem] font-medium text-text2 transition-all text-left font-instrument"
              style={{ borderRadius: 12 }}
            >
              <span className="text-base flex-shrink-0">{opt.icon}</span>
              {opt.label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Typing indicator */}
      {isTyping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 self-start">
          <div className="w-8 h-8 rounded-full bg-accent-lt text-accent border border-accent/25 flex items-center justify-center text-base">✦</div>
          <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 flex items-center gap-1.5" style={{ borderRadius: 12 }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <motion.span key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                className="w-1.5 h-1.5 bg-text3 rounded-full inline-block" />
            ))}
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
