'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiZap, FiCheck } from 'react-icons/fi';
import { CatalogIcon } from '@/components/shared/CatalogIcon';

interface AuthLeftPanelProps {
  mode: 'signin' | 'signup';
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, x: -18 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function AuthLeftPanel({ mode }: AuthLeftPanelProps) {
  const { t } = useTranslation();

  const FEATURES = [
    { icon: 'FiCpu', title: t('auth.features.models_title'), desc: t('auth.features.models_desc') },
    { icon: 'FiZap', title: t('auth.features.deploy_title'), desc: t('auth.features.deploy_desc') },
    { icon: 'FiBarChart2', title: t('auth.features.compare_title'), desc: t('auth.features.compare_desc') },
    { icon: 'FiLayers', title: t('auth.features.build_title'), desc: t('auth.features.build_desc') },
  ];

  const TESTIMONIAL = {
    quote: t('auth.testimonial.quote'),
    name: t('auth.testimonial.author'),
    role: t('auth.testimonial.role'),
    avatar: 'SC',
  };
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1C1A16 0%, #2E1A0E 55%, #1C1A16 100%)',
        minWidth: 440,
        maxWidth: 520,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #C8622A, transparent 70%)' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #C8622A, transparent 70%)' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2.5 relative z-10"
      >
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <FiZap size={16} className="text-white" />
        </div>
        <span className="font-syne text-xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
          NexusAI
        </span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="relative z-10 my-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-[0.72rem] text-white/70 mb-5 font-instrument">
          <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse flex-shrink-0" />
          {mode === 'signin' ? t('auth.badges.signin_title') : t('auth.badges.signup_title')}
        </div>
        <h2 className="font-syne text-[2rem] xl:text-[2.4rem] font-bold text-white leading-[1.1] mb-4"
          style={{ letterSpacing: '-0.04em' }}>
          {mode === 'signin'
            ? <>Your AI models<br /><span className="text-accent">await you.</span></>
            : <>The smartest way to<br /><span className="text-accent">ship with AI.</span></>}
        </h2>
        <p className="text-white/55 text-[0.88rem] leading-relaxed font-instrument max-w-[320px]">
          {mode === 'signin'
            ? 'Access all your favourite AI models, saved chats, and agent configurations in one click.'
            : 'Discover, compare and deploy 220+ AI models from the world\'s best labs — all in one platform.'}
        </p>
      </motion.div>

      {/* Feature list */}
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3.5 relative z-10 mb-8"
      >
        {FEATURES.map((f) => (
          <motion.li key={f.title} variants={item} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center flex-shrink-0 text-white">
              <CatalogIcon name={f.icon} size={20} className="text-white" />
            </div>
            <div>
              <div className="text-[0.85rem] font-semibold text-white font-instrument">{f.title}</div>
              <div className="text-[0.75rem] text-white/50 font-instrument leading-snug">{f.desc}</div>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      {/* Testimonial */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="relative z-10 border border-white/[0.1] rounded-2xl p-5 bg-white/[0.04] backdrop-blur-sm"
      >
        {/* Quote mark */}
        <div className="text-accent text-3xl font-syne leading-none mb-2 opacity-70">&quot;</div>
        <p className="text-white/75 text-[0.8rem] leading-relaxed font-instrument mb-4 italic">
          {TESTIMONIAL.quote}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white text-sm font-bold font-syne flex-shrink-0">
            {TESTIMONIAL.avatar}
          </div>
          <div>
            <div className="text-[0.82rem] font-semibold text-white font-instrument">{TESTIMONIAL.name}</div>
            <div className="text-[0.72rem] text-white/45 font-instrument">{TESTIMONIAL.role}</div>
          </div>
          <div className="ml-auto flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-xs">★</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
