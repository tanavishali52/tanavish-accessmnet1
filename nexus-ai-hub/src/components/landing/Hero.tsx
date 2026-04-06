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
import { FiSearch, FiMic, FiArrowRight, FiPaperclip, FiImage, FiX } from 'react-icons/fi';
import { MdKeyboardVoice } from 'react-icons/md';
import ToolbarTooltipButton from '@/components/shared/ToolbarTooltipButton';
import { useRouter } from 'next/navigation';
import { useTranslation, Trans } from 'react-i18next';
import HeroOnboardingPanel from '@/components/landing/HeroOnboardingPanel';
import { buildHeroOnboardingPrompt } from '@/components/landing/heroOnboardingSteps';
import { apiHeroOnboarding, type HeroOnboardStepDto } from '@/lib/api';
import { stashHeroChatFiles } from '@/lib/heroChatBridge';
import { CatalogIcon } from '@/components/shared/CatalogIcon';

const getQuickChips = (t: any) => [
  t('landing.chips.coding'),
  t('landing.chips.vision'),
  t('landing.chips.fastest'),
  t('landing.chips.opensource'),
  t('landing.chips.compare'),
];

const getActionGrid = (t: any) => [
  { icon: 'FiMessageCircle', label: t('landing.actions.chat') },
  { icon: 'FiSearch', label: t('landing.actions.compare') },
  { icon: 'FiCpu', label: t('landing.actions.build') },
  { icon: 'FiBarChart2', label: t('landing.actions.analyse') },
  { icon: 'FiImage', label: t('landing.actions.generate') },
  { icon: 'FiCompass', label: t('landing.actions.explore'), dashed: true },
];

type HeroFlow = 'idle' | 'welcome' | 'questions' | 'building';
type OnboardLoadStatus = 'loading' | 'ready' | 'error';

export default function Hero() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTypingActive, setVoiceTypingActive] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [heroFlow, setHeroFlow] = useState<HeroFlow>('idle');
  const [heroStep, setHeroStep] = useState(0);
  const [heroAnswers, setHeroAnswers] = useState<Partial<Record<string, string>>>({});
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [onboardSteps, setOnboardSteps] = useState<HeroOnboardStepDto[]>([]);
  const [onboardStatus, setOnboardStatus] = useState<OnboardLoadStatus>('loading');
  const [deferWelcomeOpen, setDeferWelcomeOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const heroSearchRootRef = useRef<HTMLDivElement>(null);

  const MAX_ATTACHMENTS = 6;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    if (!query.trim() && attachmentFiles.length === 0) {
      router.push('/chat');
      return;
    }
    stashHeroChatFiles(attachmentFiles);
    const text =
      query.trim() ||
      `Attached ${attachmentFiles.length} file${attachmentFiles.length > 1 ? 's' : ''}`;
    dispatch(setPendingAutoMessage(text));
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    setQuery('');
    setAttachments([]);
    setAttachmentFiles([]);
    router.push('/chat');
  }, [query, attachmentFiles, dispatch, router]);

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
        setAttachmentFiles([]);
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

  const pickFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const picked = Array.isArray(files) ? files : Array.from(files);
    if (picked.length === 0) return;
    const tooLarge = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      dispatch(showToast(`"${tooLarge.name}" is too large (max 10MB).`));
      return;
    }

    setAttachments((prev) => {
      const map = new Map(prev.map((a) => [`${a.name}-${a.size}-${a.type}`, a]));
      const newAttachments: ChatAttachment[] = [];
      for (const f of picked) {
        const key = `${f.name}-${f.size}-${f.type}`;
        if (!map.has(key)) {
          const attachment = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: f.name,
            size: f.size,
            type: f.type || 'application/octet-stream',
          };
          map.set(key, attachment);
          newAttachments.push(attachment);
        }
      }
      const next = Array.from(map.values()).slice(0, MAX_ATTACHMENTS);
      return next;
    });

    setAttachmentFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.type}`));
      const newFiles = picked.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.type}`));
      return [...prev, ...newFiles].slice(0, MAX_ATTACHMENTS);
    });

    if (picked.length + attachments.length > MAX_ATTACHMENTS) {
      dispatch(showToast(`Up to ${MAX_ATTACHMENTS} files can be attached.`));
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setAttachmentFiles((prev) => {
      const attachment = attachments.find((a) => a.id === id);
      if (attachment) {
        return prev.filter(
          (f) => !(f.name === attachment.name && f.size === attachment.size && f.type === attachment.type),
        );
      }
      return prev;
    });
  };

  const stopVoiceTyping = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setVoiceTypingActive(false);
  }, []);

  const startVoiceRecording = async () => {
    stopVoiceTyping();
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch(showToast('Voice recording is not supported in this browser.'));
      return;
    }
    if (!window.MediaRecorder) {
      dispatch(showToast('Audio recording is not supported in this browser.'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const fileExtension = mediaRecorder.mimeType?.includes('webm')
          ? 'webm'
          : mediaRecorder.mimeType?.includes('mp4')
            ? 'mp4'
            : 'webm';
        const audioFile = new File([audioBlob], `voice-${Date.now()}.${fileExtension}`, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        pickFiles([audioFile]);
        stream.getTracks().forEach((track) => track.stop());
        dispatch(showToast('Voice recording saved as attachment'));
      };

      mediaRecorder.onerror = () => {
        dispatch(showToast('Recording failed'));
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      dispatch(showToast('Recording... Tap the mic button again to stop'));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          dispatch(showToast('Microphone access denied. Please allow microphone access.'));
        } else if (error.name === 'NotFoundError') {
          dispatch(showToast('No microphone found.'));
        } else {
          dispatch(showToast('Could not start recording. Please check your microphone.'));
        }
      } else {
        dispatch(showToast('Could not access microphone. Please check permissions.'));
      }
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      dispatch(showToast('Recording stopped'));
    }
  };

  const toggleVoiceTyping = useCallback(() => {
    if (voiceTypingActive) {
      stopVoiceTyping();
      return;
    }
    if (isRecording) {
      stopVoiceRecording();
    }
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      dispatch(showToast('Voice typing is not supported in this browser.'));
      return;
    }
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0]?.transcript ?? '')
          .join('');
        setQuery(transcript);
      };
      recognition.onerror = () => {
        setVoiceTypingActive(false);
        recognitionRef.current = null;
      };
      recognition.onend = () => {
        setVoiceTypingActive(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      setVoiceTypingActive(true);
      dispatch(showToast('Voice typing… speak to fill the search box'));
    } catch {
      setVoiceTypingActive(false);
      dispatch(showToast('Could not start voice typing.'));
    }
  }, [voiceTypingActive, isRecording, stopVoiceTyping, dispatch]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

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
      className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden px-3 text-center sm:px-6 md:px-8 pt-[max(1rem,calc(4rem+env(safe-area-inset-top,0px)))] sm:pt-20 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] sm:pb-12"
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
        style={{ fontSize: 'clamp(1.65rem, 6vw + 0.4rem, 5.5rem)', letterSpacing: '-0.04em' }}
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
          className={`bg-white border-[1.5px] rounded-2xl sm:rounded-[28px] shadow-md transition-all ${
            searchCardActive ? 'border-accent shadow-[0_0_0_4px_rgba(200,98,42,0.1)]' : 'border-black/[0.14]'
          }`}
        >
          {attachments.length > 0 && (
            <div className="px-3 sm:px-4 pt-2.5 flex flex-wrap gap-1.5 border-b border-black/[0.06]">
              {attachments.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 bg-bg border border-black/[0.12] rounded-full px-2 py-1 text-[0.68rem] text-text2 font-instrument max-w-full"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[220px]">{a.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(a.id)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-bg2 border-none bg-none text-text3 cursor-pointer"
                    aria-label={`Remove ${a.name}`}
                  >
                    <FiX size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            <div className="flex min-h-[50px] min-w-0 flex-1 items-center sm:min-h-[58px]">
              <FiSearch size={15} className="ml-3 shrink-0 text-text3 sm:ml-5" />
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
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[0.84rem] text-text1 outline-none placeholder:text-text3 sm:px-3 sm:py-4 sm:text-[0.98rem] font-instrument"
              />
            </div>

            <div className="flex items-center gap-2 border-t border-black/[0.06] px-2 py-2 sm:border-t-0 sm:py-0 sm:pl-1 sm:pr-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  pickFiles(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  pickFiles(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              <div className="flex min-w-0 flex-1 touch-pan-x items-center gap-0.5 overflow-x-auto overscroll-x-contain py-0.5 scrollbar-none sm:flex-initial sm:justify-end sm:overflow-visible sm:py-0">
                <ToolbarTooltipButton
                  tooltip={t('common.tooltips.voice_record')}
                  onClick={() => {
                    if (isRecording) stopVoiceRecording();
                    else void startVoiceRecording();
                  }}
                  className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all sm:h-[34px] sm:w-[34px] ${
                    isRecording
                      ? 'animate-pulse bg-red-50 text-red-600'
                      : 'bg-violet-100/90 text-violet-700 hover:bg-violet-100'
                  }`}
                  aria-label={isRecording ? 'Stop recording' : 'Record voice'}
                >
                  <FiMic size={17} />
                </ToolbarTooltipButton>
                <ToolbarTooltipButton
                  tooltip={t('common.tooltips.attach_file')}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-amber-50/95 text-amber-900 transition-all hover:bg-amber-100 sm:h-[34px] sm:w-[34px]"
                  aria-label="Attach files"
                >
                  <FiPaperclip size={17} />
                </ToolbarTooltipButton>
                <ToolbarTooltipButton
                  tooltip={t('common.tooltips.attach_image')}
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-sky-50/95 text-sky-800 transition-all hover:bg-sky-100 sm:h-[34px] sm:w-[34px]"
                  aria-label="Attach images"
                >
                  <FiImage size={17} />
                </ToolbarTooltipButton>
                <ToolbarTooltipButton
                  tooltip={t('common.tooltips.voice_typing')}
                  onClick={() => toggleVoiceTyping()}
                  className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none transition-all sm:h-[34px] sm:w-[34px] ${
                    voiceTypingActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                  }`}
                  aria-label={voiceTypingActive ? 'Stop voice typing' : 'Voice typing'}
                >
                  <MdKeyboardVoice size={18} />
                </ToolbarTooltipButton>
              </div>

              <div className="hidden h-5 w-px shrink-0 bg-black/[0.14] sm:block" />

              <span className="relative inline-flex shrink-0 group">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="flex cursor-pointer items-center gap-1 rounded-[20px] border-none bg-accent px-3 py-2 text-[0.76rem] font-medium text-white font-instrument hover:bg-accent2 sm:gap-1.5 sm:rounded-[22px] sm:px-5 sm:py-2.5 sm:text-[0.875rem]"
                  aria-label={t('common.tooltips.search')}
                >
                  {t('landing.search_button')} <FiArrowRight size={12} className="shrink-0" />
                </motion.button>
                <span
                  role="tooltip"
                  className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 cursor-default select-none rounded-full bg-neutral-900 px-2.5 py-1 text-[0.7rem] font-semibold leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 sm:block group-hover:opacity-100 group-focus-within:opacity-100 whitespace-nowrap"
                  onPointerDown={(e) => e.preventDefault()}
                >
                  {t('common.tooltips.search')}
                </span>
              </span>
            </div>
          </div>

          {heroFlow !== 'idle' && (
            <div className="overflow-hidden rounded-b-2xl border-t border-black/[0.06] sm:rounded-b-[26px]">
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
            </div>
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
            key={a.icon}
            whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(200,98,42,0.14)' }}
            onClick={() => router.push('/chat')}
            className={`flex min-w-0 w-full flex-col items-center justify-center gap-1 sm:gap-1.5 bg-white border-[1.5px] border-black/[0.14] rounded-lg px-1.5 sm:px-3 py-3 sm:py-3.5 cursor-pointer transition-all shadow-card hover:bg-accent-lt hover:border-accent font-instrument overflow-hidden ${
              a.dashed ? 'border-dashed bg-bg' : ''
            }`}
            style={{ borderRadius: 16 }}
          >
            <CatalogIcon name={a.icon} size={26} className="text-accent shrink-0" />
            <span className="w-full min-w-0 max-w-full text-[0.62rem] sm:text-[0.76rem] font-semibold text-text1 text-center leading-snug break-words whitespace-normal hyphens-auto">
              {a.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 mx-auto grid w-full min-w-0 max-w-[min(360px,100%)] grid-cols-3 justify-center gap-4 sm:max-w-none sm:w-auto sm:gap-12"
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
