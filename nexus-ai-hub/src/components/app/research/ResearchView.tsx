'use client';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { openApp } from '@/store/appSlice';
import { addMessage, setOnboardPhase, setObDone } from '@/store/chatSlice';
import { FiClock, FiBookOpen } from 'react-icons/fi';
import Skeleton from '@/components/shared/Skeleton';

const ORG_COLORS: Record<string, string> = {
  'Google DeepMind': 'bg-blue-lt text-blue',
  'MIT CSAIL':       'bg-teal-lt text-teal',
  'Anthropic':       'bg-accent-lt text-accent',
  'Meta AI':         'bg-blue-lt text-blue',
  'Stanford NLP':    'bg-rose-lt text-rose',
  'DeepSeek':        'bg-amber-lt text-amber',
  'OpenAI':          'bg-blue-lt text-blue',
  'Mistral AI':      'bg-teal-lt text-teal',
};

function ResearchItemSkeleton() {
  return (
    <div className="bg-white border border-black/[0.08] p-4 sm:p-5 flex gap-3 sm:gap-4" style={{ borderRadius: 16 }}>
      <div className="flex-shrink-0 text-center w-10 sm:w-12 space-y-1">
        <Skeleton width="100%" height="0.65rem" />
        <Skeleton width="100%" height="1.5rem" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton width={80} height="1.2rem" borderRadius={10} />
          <Skeleton width={100} height="0.7rem" />
        </div>
        <Skeleton width="80%" height="1rem" className="mb-2" />
        <div className="space-y-1.5">
          <Skeleton width="100%" height="0.8rem" />
          <Skeleton width="90%" height="0.8rem" />
        </div>
      </div>
    </div>
  );
}

export default function ResearchView() {
  const dispatch = useDispatch();
  const { research, status } = useSelector((s: RootState) => s.models);

  const handleRead = (title: string) => {
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: `Tell me about: ${title}`, timestamp: Date.now() }));
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    dispatch(openApp('chat'));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-bg">
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h2 className="font-syne text-[1.3rem] sm:text-[1.6rem] font-bold text-text1" style={{ letterSpacing: '-0.03em' }}>
              AI Research Feed
            </h2>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-text2 mt-1">Latest papers, releases & breakthroughs.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-full px-3 py-1.5 text-[0.72rem] sm:text-[0.75rem] text-text2 shadow-card self-start sm:self-auto">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse flex-shrink-0" />
            Live updates
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {status === 'loading' ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ResearchItemSkeleton key={i} />
            ))
          ) : (
            research.map((item, i) => {
              const [month, day] = item.date.split(' ');
              const orgColor = ORG_COLORS[item.org] || 'bg-bg2 text-text2';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.09),0 8px 32px rgba(0,0,0,0.05)', y: -2 }}
                  className="bg-white border border-black/[0.08] p-4 sm:p-5 cursor-pointer group transition-all"
                  style={{ borderRadius: 16 }}
                  onClick={() => handleRead(item.title)}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Date */}
                    <div className="flex-shrink-0 text-center w-10 sm:w-12">
                      <div className="text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase text-text3">{month}</div>
                      <div className="font-syne text-lg sm:text-xl font-bold text-text1">{day}</div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[0.68rem] sm:text-[0.72rem] font-semibold px-2 py-0.5 rounded-full ${orgColor}`}>{item.org}</span>
                        <span className="text-[0.65rem] sm:text-[0.68rem] text-text3 flex items-center gap-0.5">
                          <FiClock size={10} /> {item.date}
                        </span>
                      </div>
                      <h3 className="font-syne font-bold text-text1 text-[0.88rem] sm:text-[0.95rem] mb-1.5 group-hover:text-accent transition-colors leading-snug" style={{ letterSpacing: '-0.01em' }}>
                        {item.title}
                      </h3>
                      <p className="text-[0.78rem] sm:text-[0.82rem] text-text2 leading-relaxed hidden sm:block">{item.summary}</p>
                      <p className="text-[0.75rem] text-text2 leading-relaxed sm:hidden line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-1 mt-2.5 text-[0.75rem] sm:text-[0.78rem] text-accent font-medium">
                        <FiBookOpen size={12} /> Discuss in Chat
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-6 sm:mt-8 bg-text1 text-white p-6 sm:p-8 text-center"
          style={{ borderRadius: 20 }}
        >
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📬</div>
          <h3 className="font-syne text-lg sm:text-xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Stay ahead of AI</h3>
          <p className="text-white/60 text-[0.8rem] sm:text-[0.85rem] mb-4 sm:mb-5">Weekly digest of the most important AI research.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email" placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[0.82rem] sm:text-[0.85rem] outline-none focus:border-white/40 font-instrument"
            />
            <button className="bg-accent text-white px-5 py-2.5 rounded-full text-[0.82rem] sm:text-[0.85rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
