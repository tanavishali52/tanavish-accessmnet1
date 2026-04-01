'use client';

import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Model } from '@/lib/api';
import { openModal } from '@/store/modalSlice';
import { openApp } from '@/store/appSlice';
import { setCurrentModelId } from '@/store/chatSlice';

interface ModelCardProps {
  model: Model;
}

const badgeStyles: Record<string, string> = {
  'badge-new':  'bg-teal-lt text-teal',
  'badge-hot':  'bg-accent-lt text-accent',
  'badge-open': 'bg-blue-lt text-blue',
  'badge-beta': 'bg-amber-lt text-amber',
};

const tagColorList = ['bg-blue-lt text-blue', 'bg-teal-lt text-teal', 'bg-amber-lt text-amber', 'bg-rose-lt text-rose'];

export default function ModelCard({ model }: ModelCardProps) {
  const dispatch = useDispatch();

  const handleOpen = () => dispatch(openModal({ model, tab: 'overview' }));

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setCurrentModelId(model.id));
    dispatch(openApp('chat'));
  };

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 2px 12px rgba(0,0,0,0.09),0 8px 32px rgba(0,0,0,0.05)' }}
      transition={{ duration: 0.2 }}
      onClick={handleOpen}
      className="bg-white border border-black/[0.08] p-4 sm:p-6 cursor-pointer shadow-card h-full flex flex-col"
      style={{ borderRadius: 20 }}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[11px] flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
            style={{ background: model.bg }}
          >
            {model.icon}
          </div>
          <div className="min-w-0">
            <div className="font-syne font-semibold text-[0.9rem] sm:text-base text-text1 truncate" style={{ letterSpacing: '-0.02em' }}>
              {model.name}
            </div>
            <div className="text-[0.68rem] sm:text-[0.75rem] text-text3 mt-0.5">{model.org}</div>
          </div>
        </div>
        {model.badge && (
          <span className={`text-[0.62rem] sm:text-[0.68rem] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ml-1 ${badgeStyles[model.badgeClass] || 'bg-gray-100 text-gray-600'}`}>
            {model.badge === 'new' ? 'New' : model.badge === 'hot' ? '🔥 Hot' : model.badge === 'open' ? 'Open' : model.badge}
          </span>
        )}
      </div>

      {/* Desc */}
      <p className="text-[0.78rem] sm:text-[0.83rem] text-text2 leading-[1.55] mb-3 sm:mb-4 flex-1 line-clamp-3">{model.desc}</p>

      {/* Tags */}
      <div className="flex gap-1 sm:gap-1.5 flex-wrap mb-3 sm:mb-4">
        {model.tags.slice(0, 3).map((tag, i) => (
          <span key={tag} className={`text-[0.62rem] sm:text-[0.7rem] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${tagColorList[i % 4]}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-black/[0.08] gap-1">
        <div className="flex items-center gap-1 text-[0.72rem] sm:text-[0.78rem] text-text2 flex-shrink-0">
          <FiStar className="text-amber-400 fill-amber-400" size={11} />
          <span className="font-medium">{model.rating}</span>
          <span className="text-text3 hidden sm:inline">({model.reviews.toLocaleString()})</span>
        </div>
        <span className="text-[0.72rem] sm:text-[0.78rem] font-medium text-teal truncate mx-1">{model.price.split('/')[0]}</span>
        <button
          onClick={handleChat}
          className="text-[0.72rem] sm:text-[0.78rem] text-accent font-medium bg-none border-none cursor-pointer hover:underline whitespace-nowrap flex-shrink-0 font-instrument"
        >
          Try →
        </button>
      </div>
    </motion.div>
  );
}
