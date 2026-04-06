'use client';

import { motion } from 'framer-motion';
import type { HeroOnboardStepDto } from '@/lib/api';
import { HeroOnboardIcon } from '@/components/landing/heroOnboardingIcons';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import { FiSmile, FiStar } from 'react-icons/fi';

type Phase = 'welcome' | 'questions' | 'building';

const welcomeCardBase =
  'relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-4 shadow-[0_6px_28px_-8px_rgba(15,23,42,0.12)] transition-all duration-200';

interface HeroOnboardingPanelProps {
  phase: Phase;
  steps: HeroOnboardStepDto[];
  stepIndex: number;
  answers: Partial<Record<string, string>>;
  welcomeProgress: number;
  onStartQuestions: () => void;
  onSkipWelcomeDirect: () => void;
  onPick: (key: string, label: string) => void;
  onSkipQuestion: () => void;
}

export default function HeroOnboardingPanel({
  phase,
  steps,
  stepIndex,
  answers,
  welcomeProgress,
  onStartQuestions,
  onSkipWelcomeDirect,
  onPick,
  onSkipQuestion,
}: HeroOnboardingPanelProps) {
  if (phase === 'building') {
    return (
      <div className="px-4 sm:px-6 py-8 sm:py-9 text-center border-t border-black/[0.06] bg-gradient-to-b from-white via-accent-lt/25 to-white">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${welcomeCardBase} max-w-sm mx-auto border-accent/15 bg-gradient-to-br from-white to-accent-lt/40 py-6 px-5`}
        >
          <div className="flex justify-center mb-3 text-accent">
            <div className="w-12 h-12 rounded-2xl bg-accent/12 flex items-center justify-center">
              <FiStar size={26} strokeWidth={2} className="animate-pulse" aria-hidden />
            </div>
          </div>
          <div className="font-syne text-[0.98rem] font-bold text-text1 mb-1">Building your personalised query…</div>
          <p className="text-[0.76rem] text-text3 leading-relaxed">Taking you to Chat Hub right away</p>
        </motion.div>
      </div>
    );
  }

  if (phase === 'welcome') {
    const features = [
      {
        icon: 'FiGrid',
        text: "No tech knowledge needed — we'll explain everything in plain language",
        card: 'bg-gradient-to-b from-violet-500/[0.11] to-violet-600/[0.04]',
        iconWrap: 'bg-violet-500/12 text-violet-700 border-violet-300/25',
      },
      {
        icon: 'FiMessageCircle',
        text: "Just answer a few simple questions about what you'd like to do",
        card: 'bg-gradient-to-b from-sky-500/[0.11] to-sky-600/[0.04]',
        iconWrap: 'bg-sky-500/12 text-sky-700 border-sky-300/25',
      },
      {
        icon: 'FiTrendingUp',
        text: "We'll build your first AI request together — step by step",
        card: 'bg-gradient-to-b from-accent/12 to-accent2/[0.07]',
        iconWrap: 'bg-accent/15 text-accent border-accent/25',
      },
    ] as const;

    return (
      <div className="relative overflow-hidden border-t border-accent/10 bg-gradient-to-b from-accent-lt/35 via-white to-bg2/25">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(200,98,42,0.12), transparent 45%), radial-gradient(circle at 90% 80%, rgba(139,92,246,0.08), transparent 40%)',
          }}
        />
        <div className="relative px-4 sm:px-6 pt-5 pb-5 sm:pb-6 max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-2 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.12)] backdrop-blur-sm">
              <FiStar size={18} className="text-accent animate-pulse" strokeWidth={2} aria-hidden />
              <FiSmile size={18} className="text-accent" aria-hidden />
              <FiStar
                size={18}
                className="text-accent animate-pulse"
                style={{ animationDelay: '0.4s' }}
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>
          <h3
            className="font-syne text-[1.05rem] sm:text-[1.15rem] font-bold text-text1 text-center mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Welcome! You&apos;re in the right place.
          </h3>
          <p className="text-[0.78rem] sm:text-[0.84rem] text-text2 text-center leading-relaxed mb-5 sm:mb-6 max-w-lg mx-auto">
            You&apos;re in a place where AI can help you explore ideas, solve problems, and create things faster — even if
            you&apos;ve never used AI before.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mb-5 sm:mb-6">
            {features.map((row, i) => (
              <motion.div
                key={row.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i, type: 'spring', stiffness: 380, damping: 28 }}
                whileHover={{ y: -2 }}
                className={`${welcomeCardBase} hover:border-accent/25 hover:shadow-[0_14px_36px_-12px_rgba(15,23,42,0.16)] ${row.card}`}
              >
                <div
                  className={`absolute top-0 right-0 w-16 h-16 rounded-bl-[2rem] opacity-[0.07] bg-gradient-to-br from-accent to-violet-500`}
                  aria-hidden
                />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white/95 shadow-sm ${row.iconWrap}`}
                    >
                      <CatalogIcon name={row.icon} size={20} />
                    </div>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/90 border border-black/[0.08] text-[0.65rem] font-bold text-text3 font-instrument">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-[0.74rem] sm:text-[0.78rem] text-text2 leading-relaxed text-left font-medium">
                    {row.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className={`${welcomeCardBase} mb-4 sm:mb-5 bg-white/95 border-black/[0.06] py-3.5 px-4`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[0.68rem] sm:text-[0.72rem] font-semibold text-text2 font-instrument">
                Preparing your questions…
              </span>
              <span className="text-[0.65rem] tabular-nums font-bold text-accent">{Math.round(welcomeProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-bg2 overflow-hidden border border-black/[0.05] shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent via-accent to-accent2 shadow-[0_0_12px_rgba(200,98,42,0.35)]"
                style={{ width: `${welcomeProgress}%` }}
                initial={false}
                transition={{ duration: 0.12 }}
              />
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartQuestions}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.86rem] font-bold text-white border-none cursor-pointer font-instrument bg-gradient-to-r from-accent to-accent2 shadow-[0_8px_28px_-6px_rgba(200,98,42,0.45)] hover:shadow-[0_12px_32px_-6px_rgba(200,98,42,0.5)] transition-shadow"
            >
              <FiStar size={17} strokeWidth={2.5} className="shrink-0" aria-hidden /> Let&apos;s get started
            </motion.button>
            <button
              type="button"
              onClick={onSkipWelcomeDirect}
              className="text-[0.78rem] sm:text-[0.8rem] text-text3 hover:text-accent bg-transparent border-none cursor-pointer font-instrument py-2 sm:py-0 underline-offset-4 hover:underline"
            >
              Skip — search directly
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = steps[stepIndex];
  if (!q) return null;

  return (
    <div className="border-t border-black/[0.06] bg-gradient-to-b from-white to-bg2/20">
      <div className="px-4 sm:px-6 pt-4 pb-2 max-w-3xl mx-auto">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-accent mb-1.5 font-instrument">
          Step {stepIndex + 1}
        </p>
        <h4
          className="font-syne text-[0.95rem] sm:text-[1.02rem] font-bold text-text1 mb-1"
          style={{ letterSpacing: '-0.01em' }}
        >
          {q.q}
        </h4>
        {q.hint ? <p className="text-[0.72rem] sm:text-[0.76rem] text-text3 italic mb-4 leading-relaxed">{q.hint}</p> : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {q.opts.map((o) => (
            <motion.button
              key={o.l}
              type="button"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => onPick(q.k, o.l)}
              className={`${welcomeCardBase} flex items-start gap-3 text-left px-3.5 py-3 sm:py-3.5 border-black/[0.08] bg-white hover:border-accent/30 hover:shadow-[0_14px_36px_-14px_rgba(15,23,42,0.14)] cursor-pointer font-instrument`}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-bg2/80">
                <HeroOnboardIcon name={o.icon} size={18} />
              </div>
              <span className="min-w-0">
                <span className="block font-semibold text-[0.8rem] sm:text-[0.84rem] text-text1">{o.l}</span>
                <span className="block text-[0.68rem] sm:text-[0.73rem] text-text3 mt-1 leading-snug">{o.sub}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-black/[0.08] bg-white/80 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom,0px))] backdrop-blur-[2px] sm:px-6 sm:pb-3">
        <div className="flex gap-1 items-center flex-wrap">
          {steps.map((step, i) => (
            <div
              key={step.k}
              className={`rounded-full transition-all ${
                i < stepIndex ? 'w-3 h-1.5 bg-accent' : i === stepIndex ? 'w-2 h-2 bg-accent scale-125' : 'w-1.5 h-1.5 bg-black/15'
              }`}
            />
          ))}
        </div>
        <span className="flex-1 text-[0.7rem] text-text3 hidden sm:inline">{answers.task ? `“${answers.task}”` : ''}</span>
        <button
          type="button"
          onClick={onSkipQuestion}
          className="text-[0.75rem] text-text3 hover:text-accent bg-transparent border-none cursor-pointer font-instrument whitespace-nowrap ml-auto"
        >
          Not sure, skip →
        </button>
      </div>
    </div>
  );
}
