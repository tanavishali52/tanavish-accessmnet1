'use client';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { openModal } from '@/store/modalSlice';
import { openApp } from '@/store/appSlice';
import { addMessage, setOnboardPhase, setObDone } from '@/store/chatSlice';
import { FiPlus } from 'react-icons/fi';
import Skeleton from '@/components/shared/Skeleton';

const TAG_COLORS: Record<string, string> = {
  'GPT-4o':    'bg-blue-lt text-blue',
  'GPT-5.4':   'bg-blue-lt text-blue',
  'Claude 3.7':'bg-teal-lt text-teal',
  'Claude 4.6':'bg-teal-lt text-teal',
  Gemini:      'bg-amber-lt text-amber',
  default:     'bg-bg2 text-text2',
};

const getTagColor = (tag: string) => TAG_COLORS[tag] || TAG_COLORS.default;

function AgentTemplateSkeleton() {
  return (
    <div className="bg-white border border-black/[0.08] p-4 sm:p-6 shadow-card h-[160px] sm:h-[180px] flex flex-col" style={{ borderRadius: 20 }}>
      <Skeleton width={32} height={32} borderRadius={8} className="mb-3" />
      <Skeleton width="50%" height="1.1rem" className="mb-2" />
      <div className="space-y-2 flex-1 mb-4">
        <Skeleton width="100%" height="0.75rem" />
        <Skeleton width="80%" height="0.75rem" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <Skeleton width={50} height="1.2rem" borderRadius={10} />
        <Skeleton width={60} height="1.2rem" borderRadius={10} />
      </div>
      <Skeleton width={100} height="0.8rem" />
    </div>
  );
}

export default function AgentsView() {
  const dispatch = useDispatch();
  const models = useSelector((s: RootState) => s.models.items);
  const { templates, status } = useSelector((s: RootState) => s.agent);

  const handleAskHub = () => {
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: 'Help me build an AI agent — walk me through it', timestamp: Date.now() }));
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    dispatch(openApp('chat'));
  };

  const handleTemplate = (modelId: string) => {
    const model = models.find((m) => m.id === modelId) || models[0];
    if (model) dispatch(openModal({ model, tab: 'agent' }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-bg">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h2 className="font-syne text-[1.3rem] sm:text-[1.6rem] font-bold text-text1 mb-1" style={{ letterSpacing: '-0.03em' }}>
            Agent Builder
          </h2>
          <p className="text-[0.82rem] sm:text-[0.9rem] text-text2">Create powerful AI agents using any model.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => handleTemplate('gpt5')}
          className="flex items-center gap-1.5 bg-accent text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[0.82rem] sm:text-[0.85rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
        >
          <FiPlus size={15} /> New Agent
        </motion.button>
      </div>

      {/* Ask Hub banner */}
      <div className="bg-white border border-accent/25 rounded-sm p-3 sm:p-4 mb-5 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ borderRadius: 12 }}>
        <div className="text-2xl flex-shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.85rem] font-semibold text-text1 mb-0.5">Not sure where to start?</div>
          <div className="text-[0.78rem] sm:text-[0.8rem] text-text2">Chat with our AI guide — describe your agent and get a personalised setup plan.</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleAskHub}
          className="border border-black/[0.14] text-text1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[0.78rem] sm:text-[0.8rem] font-medium hover:border-accent hover:text-accent transition-all whitespace-nowrap cursor-pointer bg-none font-instrument flex-shrink-0"
        >
          Ask the Hub →
        </motion.button>
      </div>

      {/* Templates label */}
      <div className="font-syne text-[0.78rem] sm:text-[0.9rem] font-bold text-text3 uppercase tracking-[0.06em] mb-3 sm:mb-4">
        Agent Templates
      </div>

      {/* Templates grid — 1 col → 2 col → 3 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {status === 'loading' ? (
          Array.from({ length: 5 }).map((_, i) => (
            <AgentTemplateSkeleton key={i} />
          ))
        ) : (
          templates.map((tmpl, i) => (
            <motion.div
              key={tmpl.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.09),0 8px 32px rgba(0,0,0,0.05)', borderColor: 'rgba(200,98,42,0.25)' }}
              onClick={() => handleTemplate(tmpl.modelId)}
              className="bg-white border border-black/[0.08] p-4 sm:p-6 cursor-pointer transition-all"
              style={{ borderRadius: 20 }}
            >
              <div className="text-xl sm:text-2xl mb-2 sm:mb-3">{tmpl.icon}</div>
              <h4 className="font-syne font-semibold text-text1 text-[0.9rem] sm:text-base mb-1.5">{tmpl.title}</h4>
              <p className="text-[0.78rem] sm:text-[0.82rem] text-text2 leading-relaxed mb-3 sm:mb-4">{tmpl.desc}</p>
              <div className="flex gap-1.5 flex-wrap mb-3 sm:mb-4">
                {tmpl.tags.map((tag) => (
                  <span key={tag} className={`text-[0.65rem] sm:text-[0.7rem] px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}>{tag}</span>
                ))}
              </div>
              <div className="text-[0.75rem] sm:text-[0.78rem] text-accent font-medium">Use template →</div>
            </motion.div>
          ))
        )}

        {/* Build from scratch */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: templates.length * 0.07 }}
          whileHover={{ background: 'rgba(200,98,42,0.1)' }}
          onClick={() => handleTemplate('gpt5')}
          className="flex flex-col items-center justify-center text-center p-5 sm:p-6 border-[1.5px] border-dashed border-accent/25 cursor-pointer transition-all min-h-[160px] sm:min-h-[180px]"
          style={{ borderRadius: 20, background: '#FDF1EB' }}
        >
          <div className="text-3xl sm:text-4xl mb-2">+</div>
          <h4 className="text-[0.85rem] sm:text-[0.9rem] font-semibold text-accent mb-1">Build from Scratch</h4>
          <p className="text-[0.72rem] sm:text-[0.78rem] text-text2 leading-snug">Full control over every detail.</p>
        </motion.div>
      </div>

      {/* Stats — 3-col grid on all sizes */}
      <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon: '🤖', value: '5+',   label: 'Templates' },
          { icon: '🔌', value: '20+',  label: 'Integrations' },
          { icon: '⚡', value: '<60s', label: 'Setup Time' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="bg-white border border-black/[0.08] p-3 sm:p-5 text-center"
            style={{ borderRadius: 12 }}
          >
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{s.icon}</div>
            <div className="font-syne text-xl sm:text-2xl font-bold text-text1">{s.value}</div>
            <div className="text-[0.68rem] sm:text-[0.78rem] text-text3 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
