'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  addMessage,
  setOnboardPhase,
  setObDone,
  setPendingAutoMessage,
  setUserGoal,
  setUserAudience,
  setUserLevel,
  ChatAttachment,
} from '@/store/chatSlice';
import { showToast } from '@/store/appSlice';
import { FiSearch, FiMic, FiArrowRight, FiUpload } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useTranslation, Trans } from 'react-i18next';
import HeroOnboardingPanel from '@/components/landing/HeroOnboardingPanel';
import { buildHeroOnboardingPrompt } from '@/components/landing/heroOnboardingSteps';
import { apiHeroOnboarding, type HeroOnboardStepDto } from '@/lib/api';

const getQuickChips = (t: any) => [
  t('landing.chips.coding'),
  t('landing.chips.vision'),
  t('landing.chips.fastest'),
  t('landing.chips.opensource'),
  t('landing.chips.compare'),
];

const getActionGrid = (t: any) => [
  { icon: '💬', label: t('landing.actions.chat') },
  { icon: '🔍', label: t('landing.actions.compare') },
  { icon: '🤖', label: t('landing.actions.build') },
  { icon: '📊', label: t('landing.actions.analyse') },
  { icon: '🖼', label: t('landing.actions.generate') },
  { icon: '✦', label: t('landing.actions.explore'), dashed: true },
];

type HeroFlow = 'idle' | 'welcome' | 'questions' | 'building';
type OnboardLoadStatus = 'loading' | 'ready' | 'error';

export default function Hero() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [heroFlow, setHeroFlow] = useState<HeroFlow>('idle');
  const [heroStep, setHeroStep] = useState(0);
  const [heroAnswers, setHeroAnswers] = useState<Partial<Record<string, string>>>({});
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [onboardSteps, setOnboardSteps] = useState<HeroOnboardStepDto[]>([]);
  const [onboardStatus, setOnboardStatus] = useState<OnboardLoadStatus>('loading');
  const [deferWelcomeOpen, setDeferWelcomeOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const heroSearchRootRef = useRef<HTMLDivElement>(null);

  const QUICK_CHIPS = getQuickChips(t);
  const ACTION_GRID = getActionGrid(t);

  useEffect(() => {
    let cancelled = false;
    setOnboardStatus('loading');
    apiHeroOnboarding()
      .then((steps) => {
        if (cancelled) return;
        setOnboardSteps(steps);
        setOnboardStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setOnboardSteps([]);
        setOnboardStatus('error');
        dispatch(showToast('Could not load guided setup. You can still search as usual.'));
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (onboardStatus !== 'ready' || !deferWelcomeOpen) return;
    setHeroFlow((f) => (f === 'idle' ? 'welcome' : f));
    setDeferWelcomeOpen(false);
  }, [onboardStatus, deferWelcomeOpen]);

  const resetHeroOnboardingUi = useCallback(() => {
    setHeroFlow('idle');
    setHeroStep(0);
    setHeroAnswers({});
    setWelcomeProgress(0);
  }, []);

  const goToChatWithCurrentQuery = useCallback(() => {
    if (query.trim() || attachments.length > 0) {
      dispatch(
        addMessage({
          id: Date.now().toString(),
          role: 'user',
          content: query.trim() || `Attached ${attachments.length} file${attachments.length > 1 ? 's' : ''}`,
          attachments: attachments.length > 0 ? attachments : undefined,
          timestamp: Date.now(),
        }),
      );
      dispatch(setPendingAutoMessage(null));
      dispatch(setOnboardPhase('chat'));
      dispatch(setObDone(true));
      setQuery('');
      setAttachments([]);
    }
    router.push('/chat');
  }, [query, attachments, dispatch, router]);

  const skipWelcomeDirect = useCallback(() => {
    resetHeroOnboardingUi();
    goToChatWithCurrentQuery();
  }, [resetHeroOnboardingUi, goToChatWithCurrentQuery]);

  const handleSearch = () => {
    if (heroFlow === 'welcome' || heroFlow === 'questions') {
      skipWelcomeDirect();
      return;
    }
    goToChatWithCurrentQuery();
  };

  const finishWithAnswers = useCallback(
    (answers: Partial<Record<string, string>>) => {
      setHeroFlow('building');
      const prompt = buildHeroOnboardingPrompt(answers, query);
      dispatch(setUserGoal(answers.task || ''));
      dispatch(setUserAudience(answers.audience || ''));
      dispatch(setUserLevel(answers.experience || ''));
      window.setTimeout(() => {
        dispatch(setPendingAutoMessage(prompt));
        dispatch(setOnboardPhase('chat'));
        dispatch(setObDone(true));
        setQuery('');
        setAttachments([]);
        resetHeroOnboardingUi();
        router.push('/chat');
      }, 1200);
    },
    [query, dispatch, resetHeroOnboardingUi, router],
  );

  const goToQuestions = useCallback(() => {
    if (onboardSteps.length === 0) {
      finishWithAnswers({});
      return;
    }
    setHeroFlow('questions');
    setHeroStep(0);
    setHeroAnswers({});
  }, [onboardSteps.length, finishWithAnswers]);

  const onPickAnswer = useCallback(
    (key: string, label: string) => {
      const merged = { ...heroAnswers, [key]: label };
      setHeroAnswers(merged);
      const next = heroStep + 1;
      if (next >= onboardSteps.length) {
        finishWithAnswers(merged);
      } else {
        setHeroStep(next);
      }
    },
    [heroAnswers, heroStep, onboardSteps.length, finishWithAnswers],
  );

  const onSkipQuestion = useCallback(() => {
    const next = heroStep + 1;
    if (next >= onboardSteps.length) {
      finishWithAnswers(heroAnswers);
    } else {
      setHeroStep(next);
    }
  }, [heroStep, heroAnswers, onboardSteps.length, finishWithAnswers]);

  const beginHeroOnboarding = useCallback(() => {
    if (onboardStatus === 'error') return;
    if (onboardStatus === 'loading') {
      setDeferWelcomeOpen(true);
      return;
    }
    setHeroFlow((f) => (f === 'idle' ? 'welcome' : f));
  }, [onboardStatus]);

  useEffect(() => {
    if (heroFlow !== 'welcome' || onboardStatus !== 'ready') return;
    setWelcomeProgress(0);
    const TOTAL_MS = 6000;
    const t0 = Date.now();
    const nSteps = onboardSteps.length;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - t0;
      const p = Math.min(100, (elapsed / TOTAL_MS) * 100);
      setWelcomeProgress(p);
      if (elapsed >= TOTAL_MS) {
        window.clearInterval(id);
        if (nSteps === 0) {
          finishWithAnswers({});
        } else {
          setHeroFlow('questions');
          setHeroStep(0);
          setHeroAnswers({});
        }
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [heroFlow, onboardStatus, onboardSteps.length, finishWithAnswers]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const root = heroSearchRootRef.current;
      if (!root || heroFlow === 'idle') return;
      if (!root.contains(e.target as Node)) {
        resetHeroOnboardingUi();
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [heroFlow, resetHeroOnboardingUi]);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      dispatch(showToast('Voice input is not supported in this browser.'));
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setQuery(transcript);
      };
      recognition.onerror = () => setMicActive(false);
      recognition.onend = () => setMicActive(false);
      recognitionRef.current = recognition;
      recognition.start();
      setMicActive(true);
      dispatch(showToast('Listening...'));
    } catch {
      setMicActive(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const picked = Array.from(files);
    if (picked.some((f) => f.size > 10 * 1024 * 1024)) {
      dispatch(showToast('One or more files are too large (max 10MB).'));
      return;
    }
    const newAttachs: ChatAttachment[] = picked.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
    }));
    setAttachments((prev) => [...prev, ...newAttachs]);
    dispatch(showToast(`${picked.length} file(s) attached.`));
  };

  const handleChip = (chip: string) => {
    const text = chip.replace(/^[^\s]+ /, '');
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }));
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    router.push('/chat');
  };

  const searchCardActive = focused || heroFlow !== 'idle';

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-14 sm:pt-20 pb-10 sm:pb-12 text-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,98,42,0.07) 0%, transparent 70%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.14) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 bg-white border border-black/[0.14] rounded-full px-3 sm:px-4 py-1.5 text-[0.72rem] sm:text-[0.78rem] text-text2 mb-6 sm:mb-8 shadow-card relative z-10"
      >
        <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse flex-shrink-0" />
        220+ AI models · Updated weekly
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-syne font-bold text-text1 leading-[1.05] max-w-[90vw] sm:max-w-[700px] md:max-w-[800px] mb-4 sm:mb-5 relative z-10 px-2"
        style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', letterSpacing: '-0.04em' }}
      >
        <Trans i18nKey="landing.hero_headline">
          Discover, Compare & <span className="text-accent">Deploy</span> AI Models
        </Trans>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[0.9rem] sm:text-[1.05rem] text-text2 max-w-[90vw] sm:max-w-[500px] mb-8 sm:mb-12 relative z-10 px-2"
      >
        {t('landing.hero_subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-[95vw] sm:max-w-[680px] relative z-10 mb-4 sm:mb-5 px-2 sm:px-0"
        ref={heroSearchRootRef}
      >
        <div
          className={`bg-white border-[1.5px] rounded-[28px] shadow-md transition-all overflow-hidden ${
            searchCardActive ? 'border-accent shadow-[0_0_0_4px_rgba(200,98,42,0.1)]' : 'border-black/[0.14]'
          }`}
        >
          <div className="flex items-center min-h-[52px] sm:min-h-[58px] relative">
            {attachments.length > 0 && (
              <div className="absolute -top-7 left-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="bg-accent text-white text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 grayscale-[0.2]">
                  <FiUpload size={10} /> {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                </span>
              </div>
            )}
            <FiSearch size={15} className="ml-4 sm:ml-5 text-text3 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                if (v.trim()) beginHeroOnboarding();
              }}
              onFocus={() => {
                setFocused(true);
                beginHeroOnboarding();
              }}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('landing.search_placeholder')}
              className="flex-1 px-2 sm:px-3 py-3 sm:py-4 text-[0.85rem] sm:text-[0.98rem] bg-transparent outline-none text-text1 placeholder:text-text3 font-instrument min-w-0"
            />
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 flex-shrink-0">
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={startVoiceInput}
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all ${micActive ? 'text-accent bg-accent-lt animate-pulse' : 'text-text3 hover:bg-bg2 hover:text-text1'}`}
              >
                <FiMic size={17} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-text3 hover:bg-bg2 hover:text-text1 transition-all"
              >
                <FiUpload size={17} />
              </button>
            </div>
            <div className="hidden sm:block w-px h-5 bg-black/[0.14] mx-1.5" />
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="bg-accent text-white flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[22px] text-[0.78rem] sm:text-[0.875rem] font-medium mr-1.5 hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument whitespace-nowrap"
            >
              {t('landing.search_button')} <FiArrowRight size={12} />
            </motion.button>
          </div>

          {heroFlow !== 'idle' && (
            <HeroOnboardingPanel
              phase={heroFlow === 'building' ? 'building' : heroFlow === 'welcome' ? 'welcome' : 'questions'}
              steps={onboardSteps}
              stepIndex={heroStep}
              answers={heroAnswers}
              welcomeProgress={welcomeProgress}
              onStartQuestions={goToQuestions}
              onSkipWelcomeDirect={skipWelcomeDirect}
              onPick={onPickAnswer}
              onSkipQuestion={onSkipQuestion}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-10 sm:mb-14 relative z-10 px-3 sm:px-0 max-w-[95vw] sm:max-w-none"
      >
        {QUICK_CHIPS.map((chip) => (
          <button
            type="button"
            key={chip}
            onClick={() => handleChip(chip)}
            className="bg-white border border-black/[0.14] rounded-full px-3 sm:px-4 py-1.5 text-[0.73rem] sm:text-[0.8rem] text-text2 cursor-pointer shadow-card hover:bg-accent-lt hover:border-accent hover:text-accent transition-all font-instrument"
          >
            {chip}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-[95vw] sm:max-w-[740px] mx-auto mb-10 sm:mb-14 relative z-10 px-2 sm:px-0"
      >
        {ACTION_GRID.map((a) => (
          <motion.button
            type="button"
            key={a.label}
            whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(200,98,42,0.14)' }}
            onClick={() => router.push('/chat')}
            className={`flex flex-col items-center gap-1 sm:gap-1.5 bg-white border-[1.5px] border-black/[0.14] rounded-lg px-2 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-all shadow-card hover:bg-accent-lt hover:border-accent font-instrument ${
              a.dashed ? 'border-dashed bg-bg' : ''
            }`}
            style={{ borderRadius: 16 }}
          >
            <span className="text-xl sm:text-[1.4rem] leading-none">{a.icon}</span>
            <span className="text-[0.62rem] sm:text-[0.76rem] font-semibold text-text1 text-center leading-[1.3]">{a.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-3 gap-6 sm:gap-12 justify-center relative z-10 w-full max-w-[360px] sm:max-w-none sm:w-auto"
      >
        {[
          { value: '220+', label: t('landing.stats.models') },
          { value: '28+', label: t('landing.stats.labs') },
          { value: '50K+', label: t('landing.stats.devs') },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <strong className="block font-syne text-[1.5rem] sm:text-[2rem] font-bold text-text1">{s.value}</strong>
            <span className="text-[0.7rem] sm:text-[0.78rem] text-text3">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
