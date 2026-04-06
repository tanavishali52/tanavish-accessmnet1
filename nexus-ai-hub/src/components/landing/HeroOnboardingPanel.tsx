'use client';

import { motion } from 'framer-motion';
import type { HeroOnboardStepDto } from '@/lib/api';
import { HeroOnboardIcon } from '@/components/landing/heroOnboardingIcons';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import { FiSmile, FiStar } from 'react-icons/fi';

type Phase = 'welcome' | 'questions' | 'building';

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
      <div className="px-4 sm:px-6 py-8 text-center border-t border-black/[0.08]">
        <div className="flex justify-center mb-2 text-accent animate-pulse">
          <FiStar size={28} strokeWidth={2} aria-hidden />
        </div>
        <div className="font-syne text-[0.95rem] font-bold text-text1 mb-1">Building your personalised query…</div>
        <p className="text-[0.78rem] text-text3">Taking you to Chat Hub right away</p>
      </div>
    );
  }

  if (phase === 'welcome') {
    return (
      <div className="relative overflow-hidden border-t border-accent/15 bg-gradient-to-br from-accent-lt/90 via-white/40 to-transparent">
        <div className="px-4 sm:px-6 pt-4 pb-4">
          <div className="flex justify-center items-center gap-2 mb-3 text-accent">
            <FiStar size={20} className="animate-pulse" strokeWidth={2} aria-hidden />
            <FiSmile size={20} aria-hidden />
            <FiStar size={20} className="animate-pulse" style={{ animationDelay: '0.4s' }} strokeWidth={2} aria-hidden />
          </div>
          <h3 className="font-syne text-[1rem] sm:text-[1.08rem] font-bold text-text1 text-center mb-2" style={{ letterSpacing: '-0.02em' }}>
            Welcome! You&apos;re in the right place.
          </h3>
          <p className="text-[0.78rem] sm:text-[0.82rem] text-text2 text-center leading-relaxed mb-4 max-w-md mx-auto">
            You&apos;re in a place where AI can help you explore ideas, solve problems, and create things faster — even if
            you&apos;ve never used AI before.
          </p>
          <div className="flex flex-col gap-2 mb-4 max-w-md mx-auto">
            {[
              { icon: 'FiGrid', text: "No tech knowledge needed — we'll explain everything in plain language" },
              { icon: 'FiMessageCircle', text: "Just answer a few simple questions about what you'd like to do" },
              { icon: 'FiTrendingUp', text: "We'll build your first AI request together — step by step" },
            ].map((row) => (
              <div
                key={row.text}
                className="flex items-start gap-2.5 bg-white/85 border border-black/[0.08] rounded-xl px-3 py-2.5 text-left"
              >
                <span className="flex-shrink-0 text-accent pt-0.5">
                  <CatalogIcon name={row.icon} size={18} className="text-accent" />
                </span>
                <span className="text-[0.74rem] sm:text-[0.78rem] text-text2 leading-snug">{row.text}</span>
              </div>
            ))}
          </div>
          <div className="mb-3 max-w-md mx-auto">
            <div className="text-[0.7rem] text-text3 mb-1.5">Preparing your questions…</div>
            <div className="h-1 rounded-full bg-bg2 overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                style={{ width: `${welcomeProgress}%` }}
                initial={false}
                transition={{ duration: 0.08 }}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onStartQuestions}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.85rem] font-semibold text-white border-none cursor-pointer font-instrument bg-gradient-to-r from-accent to-accent2 shadow-md hover:opacity-95 transition-opacity"
            >
              <FiStar size={16} strokeWidth={2.5} className="shrink-0" aria-hidden /> Let&apos;s get started
            </button>
            <button
              type="button"
              onClick={onSkipWelcomeDirect}
              className="text-[0.78rem] text-text3 hover:text-accent bg-transparent border-none cursor-pointer font-instrument py-1"
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
    <div className="border-t border-black/[0.08]">
      <div className="px-4 sm:px-6 pt-3 pb-1">
        <p className="text-[0.67rem] font-bold uppercase tracking-wider text-accent mb-1">Step {stepIndex + 1}</p>
        <h4 className="font-syne text-[0.92rem] sm:text-[0.98rem] font-bold text-text1 mb-1" style={{ letterSpacing: '-0.01em' }}>
          {q.q}
        </h4>
        {q.hint ? <p className="text-[0.72rem] sm:text-[0.76rem] text-text3 italic mb-3">{q.hint}</p> : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {q.opts.map((o) => (
            <button
              key={o.l}
              type="button"
              onClick={() => onPick(q.k, o.l)}
              className="flex items-start gap-2.5 text-left px-3 py-2.5 rounded-[var(--radius,12px)] border-[1.5px] border-black/[0.12] bg-bg hover:bg-accent-lt hover:border-accent transition-all cursor-pointer font-instrument"
            >
              <HeroOnboardIcon name={o.icon} size={17} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block font-semibold text-[0.8rem] sm:text-[0.82rem] text-text1">{o.l}</span>
                <span className="block text-[0.68rem] sm:text-[0.72rem] text-text3 mt-0.5 leading-snug">{o.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-t border-black/[0.08] bg-white/50">
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
