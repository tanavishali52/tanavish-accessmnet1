'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { closeModal, setModalTab, ModalTab } from '@/store/modalSlice';
import { openApp } from '@/store/appSlice';
import { setCurrentModelId, addMessage, setOnboardPhase, setObDone } from '@/store/chatSlice';
import { FiX, FiZap, FiCopy, FiStar, FiArrowRight, FiCheck, FiMessageCircle, FiDollarSign } from 'react-icons/fi';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const TABS: { id: ModalTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'guide',    label: 'How to Use' },
  { id: 'pricing',  label: 'Pricing' },
  { id: 'prompt',   label: 'Prompt Guide' },
  { id: 'agent',    label: 'Agents' },
  { id: 'reviews',  label: 'Reviews' },
];

export default function ModelModal() {
  const dispatch = useDispatch();
  const { isOpen, activeModel, activeTab } = useSelector((s: RootState) => s.modal);
  if (!activeModel) return null;

  const handleTryNow = () => {
    dispatch(setCurrentModelId(activeModel.id));
    dispatch(openApp('chat'));
    dispatch(closeModal());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/45 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && dispatch(closeModal())}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full sm:max-w-3xl overflow-hidden flex flex-col shadow-lg sm:rounded-[28px]"
            style={{
              borderRadius: '28px 28px 0 0',
              maxHeight: '92vh',
            }}
          >
            {/* Drag handle (mobile) */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-black/[0.12] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-black/[0.08] flex items-start gap-3 flex-shrink-0">
              <div
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-[12px] sm:rounded-[14px] flex items-center justify-center flex-shrink-0 text-text1"
                style={{ background: activeModel.bg }}
              >
                <CatalogIcon name={activeModel.icon} size={30} className="text-text1" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-syne text-[1.1rem] sm:text-[1.4rem] font-bold text-text1 leading-tight" style={{ letterSpacing: '-0.03em' }}>
                  {activeModel.name}
                </h2>
                <p className="text-[0.75rem] sm:text-[0.82rem] text-text2 truncate">
                  {`by ${activeModel.org} · ${activeModel.tags?.[0] ?? 'Model'}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleTryNow}
                  className="flex items-center gap-1 sm:gap-1.5 bg-accent text-white text-[0.75rem] sm:text-[0.82rem] font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
                >
                  <FiZap size={12} /> Try
                </button>
                <button
                  onClick={() => dispatch(closeModal())}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bg2 flex items-center justify-center text-text2 hover:bg-bg3 transition-colors border-none cursor-pointer"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* Tabs — scrollable horizontally */}
            <div className="flex gap-0 px-4 sm:px-6 pt-3 border-b border-black/[0.08] flex-shrink-0 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => dispatch(setModalTab(tab.id))}
                  className={`px-3 sm:px-4 py-2 text-[0.75rem] sm:text-[0.83rem] font-medium border-b-2 mb-[-1px] transition-all whitespace-nowrap font-instrument ${
                    activeTab === tab.id ? 'text-accent border-accent' : 'text-text1 border-transparent hover:text-text3'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
              {activeTab === 'overview' && <OverviewTab model={activeModel} />}
              {activeTab === 'guide'    && <GuideTab model={activeModel} />}
              {activeTab === 'pricing'  && <PricingTab model={activeModel} />}
              {activeTab === 'prompt'   && <PromptTab />}
              {activeTab === 'agent'    && <AgentTab model={activeModel} />}
              {activeTab === 'reviews'  && <ReviewsTab model={activeModel} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Tab panels ─────────────────────────────────────────────── */

type M = NonNullable<RootState['modal']['activeModel']>;

const modalCard =
  'rounded-2xl border border-black/[0.07] bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)]';

function OverviewTab({ model }: { model: M }) {
  const statItems = [
    {
      label: 'Rating',
      value: String(model.rating),
      sub: 'out of 5',
      icon: FiStar,
      iconWrap: 'bg-amber-400/15 text-amber-600',
    },
    {
      label: 'Reviews',
      value: `${(model.reviews / 1000).toFixed(1)}k`,
      sub: 'community',
      icon: FiMessageCircle,
      iconWrap: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Price',
      value: model.price.split('/')[0],
      sub: 'from',
      icon: FiDollarSign,
      iconWrap: 'bg-accent/12 text-accent',
    },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden ${modalCard} p-4 sm:p-5`}
      >
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
          aria-hidden
        />
        <p className="text-[0.65rem] sm:text-[0.68rem] font-semibold uppercase tracking-wider text-text3 mb-2 font-instrument">
          Summary
        </p>
        <p className="text-[0.82rem] sm:text-[0.92rem] text-text2 leading-relaxed">{model.desc}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            whileHover={{ y: -2 }}
            className={`${modalCard} p-3 sm:p-4 text-center flex flex-col items-center`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 ${s.iconWrap}`}
            >
              <s.icon size={18} strokeWidth={2} aria-hidden />
            </div>
            <div className="font-syne font-bold text-lg sm:text-xl text-text1 leading-none tabular-nums">
              {s.value}
            </div>
            <div className="text-[0.62rem] sm:text-[0.68rem] text-text3 mt-1">{s.sub}</div>
            <div className="text-[0.65rem] sm:text-[0.72rem] font-medium text-text2 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className={`${modalCard} p-4 sm:p-5`}>
        <h4 className="font-syne font-bold text-[0.85rem] sm:text-sm text-text1 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-accent" aria-hidden />
          Capabilities
        </h4>
        <div className="flex flex-wrap gap-2">
          {model.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center text-[0.68rem] sm:text-[0.75rem] text-text1 font-medium px-3 py-1.5 rounded-xl border border-black/[0.08] bg-gradient-to-b from-bg to-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-lt via-white to-[#FAF7FF] p-4 sm:p-5 shadow-[0_8px_32px_-12px_rgba(200,98,42,0.18)]"
      >
        <div
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/5 blur-2xl pointer-events-none"
          aria-hidden
        />
        <h4 className="font-syne font-bold text-[0.85rem] sm:text-sm text-accent mb-3 sm:mb-4 relative">
          Example use cases
        </h4>
        <ul className="space-y-2.5 relative">
          {[
            'Content generation & summarisation',
            'Code assistance & debugging',
            'Data analysis & insights',
            'Customer support automation',
          ].map((u) => (
            <li
              key={u}
              className="text-[0.75rem] sm:text-[0.82rem] text-text2 flex items-start gap-2.5 leading-snug"
            >
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-lg bg-accent text-white flex items-center justify-center shadow-sm">
                <FiCheck size={12} strokeWidth={3} aria-hidden />
              </span>
              {u}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

function GuideTab({ model }: { model: M }) {
  const steps = [
    { n: 1, title: 'Get API Access',    desc: `Sign up at ${model.org}'s developer portal and generate your API key.` },
    { n: 2, title: 'Install SDK',       desc: 'Install the official SDK and set your API key as an environment variable.' },
    { n: 3, title: 'First API Call',    desc: 'Use the completions endpoint with a simple prompt to test connectivity.' },
    { n: 4, title: 'Tune Parameters',   desc: 'Adjust temperature, max_tokens, and system prompt for your use case.' },
    { n: 5, title: 'Deploy & Monitor',  desc: 'Implement rate limiting, error handling, and usage monitoring.' },
  ];
  return (
    <div className="space-y-3 sm:space-y-4">
      {steps.map((s) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.03 * s.n }}
          className={`${modalCard} p-3.5 sm:p-4 flex gap-3 sm:gap-4`}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-[0.72rem] sm:text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-md shadow-accent/25">
            {s.n}
          </div>
          <div className="min-w-0">
            <div className="font-syne font-semibold text-[0.84rem] sm:text-sm text-text1 mb-1">{s.title}</div>
            <div className="text-[0.75rem] sm:text-[0.82rem] text-text2 leading-relaxed">{s.desc}</div>
          </div>
        </motion.div>
      ))}
      <div
        className={`${modalCard} overflow-hidden mt-1 border-slate-800/90 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-4 sm:p-5 font-mono text-[0.68rem] sm:text-[0.72rem] leading-relaxed shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]`}
      >
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
          <span className="text-slate-400 font-sans text-[0.62rem] sm:text-[0.65rem] font-semibold uppercase tracking-wide">
            Quick start
          </span>
          <span className="text-slate-500 text-[0.6rem]">Python</span>
        </div>
        <div className="text-slate-300 overflow-x-auto">
          <div>
            <span className="text-sky-400">import</span> openai
          </div>
          <div className="mt-1.5">client = openai.OpenAI()</div>
          <div className="mt-1.5">response = client.chat.completions.create(</div>
          <div className="ml-3">
            model=<span className="text-emerald-400">&quot;{model.id}&quot;</span>,
          </div>
          <div className="ml-3">
            messages=[
            &#123;
            <span className="text-amber-300">&quot;role&quot;</span>:{' '}
            <span className="text-emerald-400">&quot;user&quot;</span>,{' '}
            <span className="text-amber-300">&quot;content&quot;</span>:{' '}
            <span className="text-emerald-400">&quot;Hello!&quot;</span>
            &#125;]
          </div>
          <div>)</div>
        </div>
      </div>
    </div>
  );
}

function PricingTab({ model }: { model: M }) {
  const tiers = [
    {
      name: 'Pay-per-use',
      price: model.price.split('/')[0],
      blurb: 'Start fast with zero commitment',
      features: ['No commitment', 'Scale instantly', 'Standard limits', 'Community support'],
      variant: 'starter' as const,
    },
    {
      name: 'Pro',
      price: '$99/mo',
      blurb: 'Best for teams shipping weekly',
      features: ['Higher rate limits', 'Priority access', '10% discount', 'Email support'],
      variant: 'featured' as const,
      badge: 'Most popular',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      blurb: 'Security, scale & white-glove support',
      features: ['Unlimited scale', 'Dedicated infra', 'SLA guarantees', '24/7 support'],
      variant: 'enterprise' as const,
    },
  ];

  return (
    <div className="relative">
      <p className="text-[0.78rem] sm:text-[0.82rem] text-text2 text-center max-w-lg mx-auto mb-5 sm:mb-6 leading-relaxed">
        Choose how you bill for <span className="font-semibold text-text1">{model.name}</span> — every tier includes the same model quality.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:items-stretch max-w-4xl mx-auto">
        {tiers.map((t) => {
          const isFeatured = t.variant === 'featured';
          const isEnterprise = t.variant === 'enterprise';

          return (
            <motion.div
              key={t.name}
              layout
              whileHover={{ y: isFeatured ? -4 : -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={[
                'relative flex flex-col p-4 sm:p-5 rounded-2xl sm:rounded-[1.25rem]',
                isFeatured
                  ? 'sm:scale-[1.06] sm:z-[2] border-2 border-accent bg-gradient-to-b from-accent-lt via-white to-[#FDF8F5] shadow-[0_20px_50px_-12px_rgba(200,98,42,0.35)] ring-1 ring-accent/25'
                  : isEnterprise
                    ? 'sm:ml-0 border border-black/[0.1] bg-gradient-to-br from-bg via-white to-slate-50/80 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)]'
                    : 'sm:mr-0 border border-dashed border-black/[0.16] bg-bg2/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]',
              ].join(' ')}
            >
              {isFeatured && t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-[0.65rem] sm:text-[0.68rem] font-bold uppercase tracking-wide shadow-md whitespace-nowrap font-instrument">
                  {t.badge}
                </div>
              )}

              <div className={`mb-3 ${isFeatured ? 'pt-2' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  {isFeatured && <FiZap size={16} className="text-accent shrink-0" aria-hidden />}
                  <div className="font-syne font-bold text-[0.9rem] sm:text-[1rem] text-text1">{t.name}</div>
                </div>
                <p className="text-[0.68rem] sm:text-[0.72rem] text-text3 leading-snug">{t.blurb}</p>
              </div>

              <div
                className={`text-2xl sm:text-[1.65rem] font-bold font-syne mb-3 sm:mb-4 tracking-tight ${
                  isFeatured ? 'text-accent' : 'text-text1'
                }`}
              >
                {t.price}
              </div>

              <ul className="space-y-2 flex-1 mb-1">
                {t.features.map((f) => (
                  <li key={f} className="text-[0.72rem] sm:text-[0.78rem] text-text2 flex items-start gap-2 leading-snug">
                    <span
                      className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        isFeatured ? 'bg-accent text-white' : 'bg-teal/15 text-teal'
                      }`}
                    >
                      <FiCheck size={10} strokeWidth={3} aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={[
                  'mt-4 w-full py-2.5 rounded-full text-[0.78rem] sm:text-[0.8rem] font-semibold transition-all cursor-pointer font-instrument',
                  isFeatured
                    ? 'border-none bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent2 hover:shadow-accent/40'
                    : isEnterprise
                      ? 'border-[1.5px] border-text1/20 bg-white text-text1 hover:border-accent hover:text-accent'
                      : 'border border-black/[0.12] bg-white text-text2 hover:border-accent hover:text-accent hover:bg-accent-lt/40',
                ].join(' ')}
              >
                {t.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PromptTab() {
  const tips = [
    { title: 'Be Specific & Contextual', desc: 'Provide detailed context about your task, audience, and expected output format.', example: 'Write a 500-word blog post about X for a developer audience, with code examples.' },
    { title: 'Use System Prompts',       desc: "Set the model's persona and constraints in the system prompt.", example: 'You are an expert Python developer who explains code step-by-step.' },
    { title: 'Chain of Thought',         desc: 'Ask the model to reason step-by-step before answering.', example: 'Think through this problem step by step before giving your final answer: ...' },
    { title: 'Iterate & Refine',         desc: 'Start broad and progressively refine with follow-up prompts.', example: "Now make it more concise and add 3 bullet-point takeaways at the end." },
  ];
  return (
    <div className="space-y-3 sm:space-y-4">
      {tips.map((tip, i) => (
        <motion.div
          key={tip.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i }}
          className={`${modalCard} p-4 sm:p-5`}
        >
          <h4 className="font-syne font-bold text-[0.84rem] sm:text-sm text-text1 mb-1.5">{tip.title}</h4>
          <p className="text-[0.75rem] sm:text-[0.82rem] text-text2 mb-3 sm:mb-3.5 leading-relaxed">{tip.desc}</p>
          <div className="rounded-xl border border-black/[0.06] bg-gradient-to-b from-bg2/80 to-bg2/40 px-3 sm:px-3.5 py-2.5 flex items-start justify-between gap-2.5 shadow-inner">
            <p className="text-[0.7rem] sm:text-[0.76rem] text-text2 italic flex-1 leading-relaxed">{tip.example}</p>
            <button
              type="button"
              className="rounded-lg p-1.5 text-text3 hover:text-accent hover:bg-white/80 transition-colors border-none bg-transparent cursor-pointer shrink-0"
              aria-label="Copy example"
            >
              <FiCopy size={14} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AgentTab({ model }: { model: M }) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const steps = [
    "Define your agent's goal and the tasks it should autonomously complete",
    `Choose ${model.name} as the backbone — it excels at complex instructions`,
    'Configure tools: web search, code interpreter, file access, or custom APIs',
    'Write a detailed system prompt defining persona, capabilities, and constraints',
    'Test with edge cases: ambiguous inputs, failures, and multi-step tasks',
    'Deploy with monitoring — track token usage, completion rate, and errors',
  ];

  const openAgentBuilder = () => {
    dispatch(setCurrentModelId(model.id));
    dispatch(openApp('agents'));
    dispatch(closeModal());
    router.push('/agents');
  };

  const askTheHub = () => {
    const text = t('agents.banner_description');
    dispatch(
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }),
    );
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    dispatch(setCurrentModelId(model.id));
    dispatch(openApp('chat'));
    dispatch(closeModal());
    router.push('/chathub');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${modalCard} p-4 sm:p-5 flex items-start gap-3 sm:gap-4 bg-gradient-to-br from-accent-lt/90 via-white to-white border-accent/20`}
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-accent text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/30">
          <FiStar size={22} strokeWidth={2} aria-hidden />
        </div>
        <div>
          <div className="font-syne font-bold text-[0.86rem] sm:text-[0.95rem] text-accent mb-1">
            {model.name} is great for agents
          </div>
          <div className="text-[0.73rem] sm:text-[0.8rem] text-text2 leading-relaxed">
            Strong instruction-following, long context, and reliable tool use.
          </div>
        </div>
      </motion.div>

      <div className={`${modalCard} p-4 sm:p-5`}>
        <h4 className="font-syne font-bold text-[0.82rem] sm:text-sm text-text1 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-accent" aria-hidden />
          Build checklist
        </h4>
        <ul className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-bg2 border border-black/[0.06] text-text1 text-[0.7rem] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                {i + 1}
              </div>
              <p className="text-[0.75rem] sm:text-[0.83rem] text-text2 leading-relaxed pt-0.5">{s}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[0.72rem] sm:text-[0.78rem] text-text2 leading-relaxed px-0.5">
        {t('modelModal.deploy_monitoring_hint')}
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-1">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAgentBuilder}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent text-white text-[0.8rem] sm:text-[0.82rem] font-semibold px-5 py-2.5 sm:py-3 shadow-md shadow-accent/25 border-none cursor-pointer font-instrument"
        >
          {t('modelModal.open_agent_builder')}
          <FiArrowRight size={16} strokeWidth={2.5} aria-hidden />
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={askTheHub}
          className="inline-flex items-center justify-center rounded-full border-[1.5px] border-accent text-accent bg-white text-[0.8rem] sm:text-[0.82rem] font-semibold px-5 py-2.5 sm:py-3 cursor-pointer font-instrument hover:bg-accent-lt/50 transition-colors"
        >
          {t('modelModal.ask_the_hub')}
        </motion.button>
      </div>
    </div>
  );
}

function ReviewsTab({ model }: { model: M }) {
  const reviews = [
    { user: 'Alex M.',  rating: 5, date: 'Mar 2026', text: "Incredible capabilities. The reasoning is noticeably better than anything I've used. Highly recommend." },
    { user: 'Sarah K.', rating: 4, date: 'Feb 2026', text: 'Great model overall. Slightly pricey for high-volume use, but quality justifies cost for premium tasks.' },
    { user: 'Dev Pro',  rating: 5, date: 'Feb 2026', text: 'Game-changer for our engineering team. Code generation and review quality is exceptional.' },
  ];
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className={`${modalCard} p-4 sm:p-5 flex items-center gap-4 sm:gap-6`}>
        <div className="text-center flex-shrink-0 rounded-2xl bg-gradient-to-b from-amber-50/90 to-white border border-amber-200/40 px-4 py-3 sm:px-5 sm:py-4 shadow-inner">
          <div className="text-3xl sm:text-[2.25rem] font-bold font-syne text-text1 leading-none tabular-nums">
            {model.rating}
          </div>
          <div className="flex justify-center text-amber-500 text-sm sm:text-base mt-1.5 gap-0.5">
            {'★'.repeat(Math.round(model.rating))}
          </div>
          <div className="text-[0.62rem] sm:text-[0.68rem] text-text3 mt-2 font-medium">
            {(model.reviews / 1000).toFixed(1)}k reviews
          </div>
        </div>
        <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-[0.65rem] text-text3 w-2.5 tabular-nums font-medium">{n}</span>
              <div className="flex-1 bg-bg2 rounded-full h-2 overflow-hidden border border-black/[0.04]">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full"
                  style={{ width: `${n === 5 ? 70 : n === 4 ? 20 : n === 3 ? 7 : 2}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`${modalCard} p-4 sm:p-[1.125rem]`}
          >
            <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-[0.72rem] sm:text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-md shadow-accent/25 ring-2 ring-white">
                {r.user[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.82rem] sm:text-sm font-semibold text-text1">{r.user}</div>
                <div className="text-[0.62rem] sm:text-[0.68rem] text-text3">{r.date}</div>
              </div>
              <div className="flex text-amber-500 text-[0.72rem] sm:text-sm shrink-0 gap-px">
                {'★'.repeat(r.rating)}
              </div>
            </div>
            <p className="text-[0.75rem] sm:text-[0.82rem] text-text2 leading-relaxed pl-0.5">{r.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
