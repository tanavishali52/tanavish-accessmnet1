'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentModelId } from '@/store/chatSlice';
import { openApp, showToast } from '@/store/appSlice';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import { ChatSidebarModelRowSkeleton } from '@/components/shared/catalogSkeletons';

export default function ChatSidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const currentModelId = useSelector((s: RootState) => s.chat.currentModelId);
  const { items: models, status } = useSelector((s: RootState) => s.models);
  const [search, setSearch] = useState('');

  const catalogPending = status === 'loading' || (status === 'idle' && models.length === 0);

  const filtered = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.org.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    dispatch(setCurrentModelId(id));
    const model = models.find((m) => m.id === id);
    if (model) dispatch(showToast(t('chat.sidebar.switched_to_toast', { name: model.name })));
  };

  return (
    <div className="w-[240px] lg:w-[252px] h-full flex-shrink-0 bg-white border-r border-black/[0.08] overflow-y-auto flex flex-col">
      {/* Search */}
      <div className="p-3 sm:p-4 border-b border-black/[0.08]">
        <div className="text-[0.65rem] sm:text-[0.68rem] text-text3 font-semibold uppercase tracking-[0.08em] mb-2 sm:mb-3">
          {t('chat.sidebar.models')}
        </div>
        <div className="relative">
          <FiSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('chat.sidebar.search')}
            className="w-full pl-7 pr-3 py-2 text-[0.78rem] border border-black/[0.14] bg-bg text-text1 outline-none focus:border-accent font-instrument"
            style={{ borderRadius: 8 }}
          />
        </div>
      </div>

      {/* Model list */}
      <div className="p-2 sm:p-3 flex-1">
        {catalogPending &&
          Array.from({ length: 8 }).map((_, i) => <ChatSidebarModelRowSkeleton key={i} />)}
        {status === 'error' && models.length === 0 && (
          <div className="px-2 py-6 text-center text-[0.78rem] text-text3 leading-relaxed">
            Could not load models. Check your connection and refresh.
          </div>
        )}
        {!catalogPending && filtered.map((model) => (
          <button
            key={model.id}
            onClick={() => handleSelect(model.id)}
            className={`w-full flex items-center gap-2 px-2.5 sm:px-3 py-2 cursor-pointer transition-colors mb-0.5 text-left ${
              currentModelId === model.id ? 'bg-accent-lt' : 'hover:bg-bg2'
            }`}
            style={{ borderRadius: 8 }}
          >
            <div
              className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0 text-text1"
              style={{ background: model.bg }}
            >
              <CatalogIcon name={model.icon} size={18} />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[0.78rem] sm:text-[0.82rem] font-medium text-text1 truncate">{model.name}</div>
              <div className="text-[0.62rem] sm:text-[0.68rem] text-text3">
                <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${model.badge === 'new' ? 'bg-green' : 'bg-amber'}`} />
                {model.org}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Create Agent */}
      <div className="p-3 sm:p-4 border-t border-black/[0.08]">
        <button
          type="button"
          onClick={() => {
            dispatch(openApp('agents'));
            router.push('/agents');
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-accent-lt border border-accent/25 text-[0.75rem] sm:text-[0.78rem] text-accent font-medium hover:bg-accent hover:text-white transition-all cursor-pointer font-instrument"
          style={{ borderRadius: 8 }}
        >
          <FiPlus size={13} /> {t('chat.sidebar.create_agent')}
        </button>
      </div>
    </div>
  );
}
