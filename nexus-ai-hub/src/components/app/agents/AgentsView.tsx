'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCpu,
  FiChevronRight,
  FiEdit2,
  FiEdit3,
  FiEye,
  FiGrid,
  FiPlus,
  FiSearch,
  FiSend,
  FiShuffle,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { RootState } from '@/store';
import { addMessage, setOnboardPhase, setObDone } from '@/store/chatSlice';
import { openApp, showToast } from '@/store/appSlice';
import {
  applyTemplate,
  openBuilder,
  removeAgent,
  setUserAgents,
  setUserAgentsError,
  setUserAgentsLoading,
} from '@/store/agentSlice';
import {
  apiAgentExplore,
  apiDeleteAgent,
  apiGetAgents,
  type AgentExplorePayload,
  type AgentExploreTabId,
  type AgentRecord,
} from '@/lib/api';
import Skeleton from '@/components/shared/Skeleton';
import AgentBuilder from '@/components/app/agents/AgentBuilder';
import AgentChatPanel from '@/components/app/agents/AgentChatPanel';
import { CatalogIcon } from '@/components/shared/CatalogIcon';

const TAG_COLORS: Record<string, string> = {
  'GPT-4o': 'bg-blue-lt text-blue',
  'GPT-5.4': 'bg-blue-lt text-blue',
  'Claude 3.7': 'bg-teal-lt text-teal',
  'Claude 4.6': 'bg-teal-lt text-teal',
  Gemini: 'bg-amber-lt text-amber',
  default: 'bg-bg2 text-text2',
};

const getTagColor = (tag: string) => TAG_COLORS[tag] || TAG_COLORS.default;

const TAB_ICONS: Record<AgentExploreTabId, ReactNode> = {
  use_cases: <FiGrid size={13} />,
  build_business: <FiBriefcase size={13} />,
  learn: <FiBookOpen size={13} />,
  monitor: <FiEye size={13} />,
  research: <FiSearch size={13} />,
  create: <FiEdit3 size={13} />,
  analyze: <FiBarChart2 size={13} />,
};

const agentHubCard =
  'rounded-2xl border border-black/[0.07] bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]';

function AgentTemplateSkeleton() {
  return (
    <div className={`${agentHubCard} p-4 h-[132px] flex flex-col`}>
      <Skeleton width={32} height={32} borderRadius={10} className="mb-2.5" />
      <Skeleton width="55%" height="0.85rem" className="mb-1.5" />
      <div className="space-y-1.5 flex-1 mb-2">
        <Skeleton width="100%" height="0.65rem" />
        <Skeleton width="70%" height="0.65rem" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton width={48} height="1.05rem" borderRadius={999} />
        <Skeleton width={52} height="1.05rem" borderRadius={999} />
      </div>
    </div>
  );
}

export default function AgentsView() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const userId = useSelector((s: RootState) => s.auth.user?.id);
  const models = useSelector((s: RootState) => s.models.items);
  const { templates, status: catalogStatus, agents: userAgents, userAgentsStatus } = useSelector(
    (s: RootState) => s.agent,
  );
  const templatesPending =
    catalogStatus === 'loading' || (catalogStatus === 'idle' && templates.length === 0);

  const [explore, setExplore] = useState<AgentExplorePayload | null>(null);
  const [exploreLoadError, setExploreLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentExploreTabId>('use_cases');
  const [suggestionPermutation, setSuggestionPermutation] = useState<number[] | null>(null);
  const [exploreSearch, setExploreSearch] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [appsDrawerOpen, setAppsDrawerOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<AgentRecord | null>(null);
  /** First message to auto-send when opening agent chat from the hub search bar. */
  const [agentHubBootstrapMessage, setAgentHubBootstrapMessage] = useState<string | null>(null);

  const activeChatAgent = useMemo(() => {
    if (!chatAgent) return null;
    return userAgents.find((a) => a._id === chatAgent._id) ?? chatAgent;
  }, [chatAgent, userAgents]);

  const clearAgentHubBootstrap = useCallback(() => setAgentHubBootstrapMessage(null), []);

  useEffect(() => {
    if (!chatAgent) return;
    if (!userAgents.some((a) => a._id === chatAgent._id)) {
      setChatAgent(null);
    }
  }, [userAgents, chatAgent]);

  useEffect(() => {
    let cancelled = false;
    apiAgentExplore()
      .then((data) => {
        if (!cancelled) {
          setExplore(data);
          setExploreLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExplore(null);
          setExploreLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSuggestionPermutation(null);
  }, [activeTab]);

  useEffect(() => {
    if (!userId) return;
    dispatch(setUserAgentsLoading());
    apiGetAgents()
      .then((list) => dispatch(setUserAgents(list)))
      .catch(() => dispatch(setUserAgentsError()));
  }, [userId, dispatch]);

  const tabIds = useMemo(() => {
    const fromApi = explore?.tabs.map((x) => x.id);
    if (fromApi?.length) return fromApi as AgentExploreTabId[];
    return [
      'use_cases',
      'build_business',
      'learn',
      'monitor',
      'research',
      'create',
      'analyze',
    ] as AgentExploreTabId[];
  }, [explore]);

  const tabLabel = useCallback(
    (id: AgentExploreTabId) => {
      const key = `agents.explore.tabs.${id}`;
      const tr = t(key);
      if (tr === key) return explore?.tabs.find((x) => x.id === id)?.label ?? id;
      return tr;
    },
    [explore, t],
  );

  const baseSuggestions = explore?.suggestions[activeTab] ?? [];

  const suggestionsOrdered = useMemo(() => {
    if (!suggestionPermutation || suggestionPermutation.length !== baseSuggestions.length) {
      return baseSuggestions;
    }
    return suggestionPermutation.map((i) => baseSuggestions[i]).filter(Boolean);
  }, [baseSuggestions, suggestionPermutation]);

  const filteredSuggestions = useMemo(() => {
    const q = exploreSearch.trim().toLowerCase();
    if (!q) return suggestionsOrdered;
    return suggestionsOrdered.filter((s) => s.text.toLowerCase().includes(q));
  }, [suggestionsOrdered, exploreSearch]);

  const shuffleSuggestions = () => {
    const n = baseSuggestions.length;
    if (!n) return;
    const idx = baseSuggestions.map((_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setSuggestionPermutation(idx);
  };

  const sendToChat = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    dispatch(
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }),
    );
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    dispatch(openApp('chat'));
  };

  const handleAskHub = () => {
    sendToChat(t('agents.banner_description'));
    router.push('/chathub');
  };

  const openNewAgent = () => {
    setLibraryOpen(true);
  };

  const closeLibrary = () => setLibraryOpen(false);

  const startFromTemplate = (tmpl: (typeof templates)[0]) => {
    if (tmpl.title === 'Start from Scratch') {
      dispatch(openBuilder(undefined));
      dispatch(
        applyTemplate({
          name: '',
          description: tmpl.desc,
          modelId: tmpl.modelId,
          systemPrompt: tmpl.systemPrompt,
          tools: tmpl.tools,
        }),
      );
      return;
    }
    dispatch(openBuilder(undefined));
    dispatch(
      applyTemplate({
        name: tmpl.title,
        description: tmpl.desc,
        modelId: tmpl.modelId,
        systemPrompt: tmpl.systemPrompt,
        tools: tmpl.tools,
      }),
    );
  };

  const handleScratchCard = () => {
    const scratch = templates.find((x) => x.title === 'Start from Scratch');
    if (scratch) startFromTemplate(scratch);
    else {
      dispatch(openBuilder(undefined));
      dispatch(
        applyTemplate({
          name: '',
          description: '',
          modelId: 'gpt5',
          systemPrompt: '',
          tools: [],
        }),
      );
    }
  };

  const tplForGrid = templates.filter((tmpl) => tmpl.title !== 'Start from Scratch');

  const exploreSubmit = () => {
    const text = exploreSearch.trim() || t('agents.search_placeholder');
    setExploreSearch('');
    if (userAgents.length === 0) {
      dispatch(showToast(t('agents.need_agent_for_chat')));
      return;
    }
    const pick =
      (selectedAgentId ? userAgents.find((a) => a._id === selectedAgentId) : undefined) ?? userAgents[0];
    setAgentHubBootstrapMessage(text);
    openAgentChat(pick);
  };

  const useCaseApps = explore?.useCaseApps[activeTab] ?? [];

  const deleteAgent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDeleteAgent(id);
      dispatch(removeAgent(id));
      if (selectedAgentId === id) setSelectedAgentId(null);
      dispatch(showToast(t('agents.agent_deleted')));
    } catch {
      dispatch(showToast('Could not delete agent'));
    }
  };

  const openAgentChat = (agent: AgentRecord) => {
    setChatAgent(agent);
    setSelectedAgentId(agent._id);
    closeLibrary();
  };

  const openAgentConfigure = (agent: AgentRecord) => {
    dispatch(openBuilder(agent));
    closeLibrary();
  };

  const modelName = (modelId: string) => models.find((m) => m.id === modelId)?.name ?? modelId;

  if (activeChatAgent) {
    return (
      <div className="flex flex-1 h-full min-h-0 overflow-hidden bg-bg flex-col">
        <AgentChatPanel
          agent={activeChatAgent}
          initialOutboundMessage={agentHubBootstrapMessage}
          onInitialOutboundConsumed={clearAgentHubBootstrap}
          onBack={() => setChatAgent(null)}
          onOpenSettings={() => dispatch(openBuilder(activeChatAgent))}
        />
        <AgentBuilder />
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full min-h-0 overflow-hidden bg-bg flex-col lg:flex-row">
      {/* Left: builder intro — desktop / large tablet only */}
      <aside className="hidden lg:flex w-full lg:w-[min(280px,32vw)] xl:w-[280px] shrink-0 flex-col gap-4 border-b lg:border-b-0 lg:border-r border-black/[0.08] bg-white px-4 sm:px-5 py-5 lg:py-6 overflow-y-auto max-h-[min(52vh,420px)] lg:max-h-none">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white shrink-0">
            <FiCpu size={22} aria-hidden />
          </div>
          <div>
            <h2 className="font-syne text-[1.05rem] font-bold text-text1 tracking-tight leading-tight">
              {t('agents.header_title')}
            </h2>
            <p className="text-[0.72rem] text-text2 leading-snug mt-0.5">{t('agents.sidebar_blurb')}</p>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNewAgent}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-accent text-white py-2.5 text-[0.82rem] font-medium hover:bg-accent2 border-none cursor-pointer font-instrument"
        >
          <FiPlus size={16} /> {t('agents.button_new_agent')}
        </motion.button>

        <div className="rounded-lg border border-accent/25 bg-accent-lt p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FiStar size={16} className="shrink-0 text-accent" strokeWidth={2} aria-hidden />
            <span className="text-[0.8rem] font-semibold text-text1">{t('agents.banner_title')}</span>
          </div>
          <p className="text-[0.74rem] text-text2 leading-relaxed pl-7">{t('agents.banner_description')}</p>
          <button
            type="button"
            onClick={handleAskHub}
            className="self-start mt-0.5 text-[0.74rem] font-medium text-accent border border-black/[0.12] rounded-full px-3 py-1.5 bg-white/80 hover:border-accent cursor-pointer font-instrument"
          >
            {t('agents.banner_cta')}
          </button>
        </div>
      </aside>

      {/* Main hub or library — grows on small screens when sidebar is hidden */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-bg">
        {libraryOpen ? (
          <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row bg-bg md:bg-bg">
            {/* Agent Library — center column on desktop; below My Agents on small screens */}
            <div className="order-2 md:order-1 flex-1 flex flex-col min-w-0 min-h-0 bg-white md:bg-bg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 border-b border-black/[0.08] bg-white shrink-0 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                <div className="min-w-0">
                  <div className="font-syne font-bold text-text1 text-[0.95rem] sm:text-[1.05rem] tracking-tight">
                    {t('agents.agent_library')}
                  </div>
                  <div className="text-[0.7rem] sm:text-[0.74rem] text-text2 mt-0.5 leading-snug">{t('agents.library_sub')}</div>
                </div>
                <span className="text-[0.68rem] sm:text-[0.72rem] font-semibold text-accent border border-accent/30 rounded-full px-3 sm:px-3.5 py-1.5 bg-gradient-to-b from-accent-lt to-accent-lt/70 shadow-sm w-fit shrink-0">
                  {t('agents.default_agents')}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 min-h-0 overscroll-contain md:bg-bg">
                {templatesPending ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <AgentTemplateSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
                    {tplForGrid.map((tmpl) => (
                      <motion.button
                        type="button"
                        key={tmpl.title}
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        onClick={() => {
                          startFromTemplate(tmpl);
                          closeLibrary();
                        }}
                        className={`${agentHubCard} p-4 sm:p-[1.125rem] text-left cursor-pointer border-black/[0.06] hover:border-accent/25 hover:shadow-[0_14px_36px_-14px_rgba(15,23,42,0.18)] transition-all min-w-0 group`}
                      >
                        <div className="flex items-center gap-2.5 mb-2 min-w-0">
                          <span className="shrink-0 w-10 h-10 rounded-xl bg-bg2 border border-black/[0.06] flex items-center justify-center text-text1 group-hover:border-accent/20 group-hover:bg-accent-lt/40 transition-colors">
                            <CatalogIcon name={tmpl.icon} size={22} />
                          </span>
                          <span className="font-syne font-bold text-text1 text-[0.8rem] sm:text-[0.86rem] truncate leading-tight">
                            {tmpl.title}
                          </span>
                        </div>
                        <p className="text-[0.72rem] sm:text-[0.74rem] text-text2 leading-relaxed line-clamp-2 mb-3 min-h-[2.5rem]">
                          {tmpl.desc}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tmpl.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`text-[0.62rem] px-2.5 py-1 rounded-full font-semibold border border-black/[0.06] ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() => {
                        handleScratchCard();
                        closeLibrary();
                      }}
                      className="rounded-2xl border-2 border-dashed border-accent/35 bg-gradient-to-br from-accent-lt via-accent-lt/80 to-violet-100/40 shadow-[0_4px_24px_-10px_rgba(200,98,42,0.2)] flex flex-col items-center justify-center p-5 min-h-[132px] cursor-pointer hover:border-accent/55 transition-all"
                    >
                      <div className="w-11 h-11 rounded-full bg-white/90 border border-accent/20 flex items-center justify-center text-accent text-xl font-light mb-2 shadow-sm">
                        +
                      </div>
                      <span className="text-[0.8rem] font-bold text-accent font-syne">{t('agents.build_from_scratch')}</span>
                      <span className="text-[0.65rem] text-text3 mt-1 text-center max-w-[12rem] leading-snug">
                        {t('agents.build_scratch_sub')}
                      </span>
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* My Agents — right column on desktop; first on small screens */}
            <div className="order-1 md:order-2 w-full md:w-[min(288px,30vw)] lg:w-[280px] md:shrink-0 flex flex-col min-h-0 max-h-[min(42vh,360px)] md:max-h-none border-b md:border-b-0 md:border-l border-black/[0.08] bg-white md:shadow-[-8px_0_24px_-12px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between px-3 sm:px-4 pt-4 sm:pt-5 pb-2.5 sm:pb-3 shrink-0 md:bg-gradient-to-b from-white to-bg2/30">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white shadow-md shadow-accent/25">
                    <FiCpu size={18} aria-hidden />
                  </div>
                  <span className="font-syne font-bold text-text1 text-[0.95rem] tracking-tight">{t('agents.my_agents')}</span>
                </div>
                <button
                  type="button"
                  onClick={closeLibrary}
                  className="w-8 h-8 rounded-xl border border-black/[0.08] bg-white flex items-center justify-center text-text2 hover:bg-bg2 hover:border-accent/20 cursor-pointer shadow-sm transition-colors"
                  aria-label="Close"
                >
                  <FiX size={15} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 pb-2 min-h-0 overscroll-contain">
                {userAgentsStatus === 'loading' ? (
                  <div className="space-y-2.5 p-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} height={64} borderRadius={14} className="w-full" />
                    ))}
                  </div>
                ) : userAgents.length === 0 ? (
                  <div
                    className={`text-center px-3 py-8 mx-1 my-1 ${agentHubCard} border-dashed border-black/[0.12] shadow-none bg-bg2/40`}
                  >
                    <div className="flex justify-center mb-2 opacity-40 text-text3">
                      <FiCpu size={34} aria-hidden />
                    </div>
                    <div className="text-[0.78rem] font-semibold text-text2">{t('agents.no_agents_title')}</div>
                    <div className="text-[0.72rem] mt-1 leading-snug text-text3">{t('agents.no_agents_hint')}</div>
                  </div>
                ) : (
                  userAgents.map((agent) => (
                    <div
                      key={agent._id}
                      className={`w-full rounded-2xl border px-3 py-2.5 mb-2 flex items-center gap-2 transition-all shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] ${
                        selectedAgentId === agent._id
                          ? 'border-accent bg-accent-lt shadow-[0_8px_24px_-8px_rgba(200,98,42,0.22)] ring-1 ring-accent/20'
                          : 'border-black/[0.07] bg-white hover:border-accent/30 hover:shadow-[0_8px_20px_-10px_rgba(15,23,42,0.12)]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openAgentChat(agent)}
                        className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer border-none bg-transparent p-0 font-instrument rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/40"
                      >
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-bg2 border border-black/[0.06] flex items-center justify-center">
                          <CatalogIcon
                            name={models.find((m) => m.id === agent.modelId)?.icon ?? 'FiCpu'}
                            size={18}
                            className="text-text1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.8rem] font-semibold text-text1 truncate">{agent.name}</div>
                          <div className="text-[0.65rem] text-text3 truncate">
                            {modelName(agent.modelId)} · {agent.tools?.length ? `${agent.tools.length} tools` : 'No tools'}
                          </div>
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ring-2 ring-white shadow-sm ${
                            agent.status === 'active' ? 'bg-green' : agent.status === 'paused' ? 'bg-text3' : 'bg-amber'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-text3 hover:text-accent hover:bg-accent/10 cursor-pointer shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAgentConfigure(agent);
                        }}
                        aria-label={t('agents.edit')}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-text3 hover:text-rose hover:bg-rose/10 cursor-pointer shrink-0"
                        onClick={(e) => deleteAgent(e, agent._id)}
                        aria-label={t('agents.delete_agent')}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 pt-2 border-t border-black/[0.08] shrink-0 bg-gradient-to-t from-bg2/40 to-white">
                <button
                  type="button"
                  onClick={() => {
                    closeLibrary();
                    dispatch(openBuilder(undefined));
                  }}
                  className="w-full rounded-full border border-accent/35 bg-gradient-to-b from-accent-lt to-accent-lt/70 text-accent text-[0.78rem] font-bold py-2.5 hover:border-accent hover:shadow-md shadow-sm cursor-pointer font-instrument transition-all"
                >
                  <FiStar size={14} className="inline-block align-middle mr-1" strokeWidth={2.5} aria-hidden />
                  {t('agents.create_custom')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="lg:hidden flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-black/[0.08] bg-white shrink-0">
              <span className="font-syne font-bold text-text1 text-[0.9rem] sm:text-[0.95rem] min-w-0 truncate">{t('common.agents')}</span>
              <button
                type="button"
                onClick={openNewAgent}
                aria-label={t('agents.button_new_agent')}
                className="flex items-center gap-1 rounded-full bg-accent text-white text-[0.72rem] sm:text-[0.78rem] font-medium px-2.5 sm:px-3 py-1.5 border-none cursor-pointer shrink-0 whitespace-nowrap"
              >
                <FiPlus size={14} />{' '}
                <span className="max-[340px]:hidden sm:inline">{t('agents.button_new_agent')}</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {appsDrawerOpen ? (
                  <motion.div
                    key="drawer"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="flex flex-col flex-1 min-h-0 bg-white"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.08] shrink-0">
                      <button
                        type="button"
                        onClick={() => setAppsDrawerOpen(false)}
                        className="w-9 h-9 rounded-full border border-black/[0.1] flex items-center justify-center text-text2 hover:border-accent hover:text-accent cursor-pointer bg-bg"
                      >
                        <FiChevronRight className="rotate-180" size={16} />
                      </button>
                      <div>
                        <div className="font-syne font-bold text-text1">{t('agents.use_case_library')}</div>
                        <div className="text-[0.72rem] text-text2">
                          {t('agents.apps_count', { count: useCaseApps.length })} · {tabLabel(activeTab)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 content-start bg-bg overscroll-contain">
                      {useCaseApps.map((app, i) => (
                        <motion.button
                          type="button"
                          key={app.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => sendToChat(`Help me build: ${app.name}. ${app.desc}`)}
                          className="text-left bg-white border border-black/[0.08] rounded-xl p-3 hover:border-accent/30 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <CatalogIcon name={app.icon} size={22} className="text-text1 shrink-0" />
                            <span className="font-syne font-semibold text-[0.82rem] text-text1 leading-tight">{app.name}</span>
                          </div>
                          <div className="text-[0.65rem] font-medium text-accent mb-1">{app.type}</div>
                          <p className="text-[0.72rem] text-text2 leading-snug line-clamp-3">{app.desc}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col flex-1 min-h-0 overflow-y-auto bg-white"
                  >
                    <div className="text-center px-4 sm:px-6 pt-5 sm:pt-8 pb-3 sm:pb-4 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(200,98,42,0.06)_0%,transparent_70%)] shrink-0">
                      <h1 className="font-syne text-[clamp(1.35rem,4.5vw,2rem)] font-bold text-text1 tracking-tight leading-tight px-1">
                        {t('agents.hero_prefix')}{' '}
                        <span className="text-accent">{t('agents.hero_accent')}</span>
                      </h1>
                      <p className="text-[0.8rem] sm:text-[0.85rem] text-text2 mt-2 max-w-md mx-auto leading-relaxed px-1">{t('agents.hero_sub')}</p>
                    </div>

                    {userAgents.length > 0 && userAgentsStatus === 'loaded' && (
                      <div className="shrink-0 px-3 sm:px-5 py-2 border-t border-black/[0.06] bg-white">
                        <div className="text-[0.65rem] font-bold text-text3 uppercase tracking-wider mb-1.5 max-w-3xl mx-auto w-full">
                          {t('agents.my_agents')}
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x max-w-3xl mx-auto w-full pb-0.5">
                          {userAgents.map((a) => (
                            <button
                              key={a._id}
                              type="button"
                              onClick={() => openAgentChat(a)}
                              className="snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-bg px-3 py-1.5 text-[0.76rem] sm:text-[0.78rem] font-medium text-text1 hover:border-accent hover:bg-accent-lt cursor-pointer font-instrument whitespace-nowrap max-w-[220px]"
                            >
                                  <CatalogIcon
                                    name={models.find((m) => m.id === a.modelId)?.icon ?? 'FiCpu'}
                                    size={17}
                                    className="shrink-0 text-stone-700"
                                  />
                              <span className="truncate">{a.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-3 sm:px-5 pt-2 pb-1 border-t border-black/[0.08] bg-white shrink-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:items-end max-w-3xl mx-auto w-full">
                        <div className="flex-1 w-full min-w-0 rounded-[1.35rem] border-[1.5px] border-black/[0.12] bg-bg focus-within:border-accent transition-colors overflow-hidden">
                          <textarea
                            rows={1}
                            value={exploreSearch}
                            onChange={(e) => setExploreSearch(e.target.value)}
                            onInput={(e) => {
                              const el = e.target as HTMLTextAreaElement;
                              el.style.height = 'auto';
                              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                exploreSubmit();
                              }
                            }}
                            placeholder={t('agents.search_placeholder')}
                            className="w-full px-4 py-3 text-[0.87rem] bg-transparent border-none outline-none resize-none font-instrument text-text1 min-h-[44px] max-h-[120px] leading-relaxed placeholder:text-text3"
                          />
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={exploreSubmit}
                          className="w-full sm:w-11 h-11 sm:mb-0.5 shrink-0 rounded-full bg-accent text-white inline-flex items-center justify-center gap-2 sm:gap-0 border-none cursor-pointer hover:bg-accent2 font-instrument text-[0.78rem] sm:text-base font-semibold sm:font-normal"
                        >
                          <FiSend size={18} className="sm:mr-0" />
                          <span className="sm:hidden">{t('agents.search_send')}</span>
                        </motion.button>
                      </div>
                      {exploreLoadError && (
                        <p className="text-center text-[0.7rem] text-amber mt-2">Could not load explore content; templates still work.</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-6 lg:px-8 pt-3 pb-2 overflow-x-auto scrollbar-none bg-white shrink-0 snap-x snap-mandatory touch-pan-x">
                      {tabIds.map((id) => (
                        <button
                          type="button"
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`flex items-center gap-1 sm:gap-1.5 shrink-0 snap-start rounded-full px-2.5 sm:px-3 py-1.5 text-[0.68rem] sm:text-[0.74rem] font-semibold border transition-all cursor-pointer font-instrument whitespace-nowrap ${
                            activeTab === id
                              ? 'bg-accent text-white border-accent shadow-[0_2px_10px_rgba(200,98,42,0.25)]'
                              : 'bg-bg border-black/[0.1] text-text2 hover:border-accent/40 hover:text-accent'
                          }`}
                        >
                          {TAB_ICONS[id]}
                          {tabLabel(id)}
                        </button>
                      ))}
                    </div>

                    <div className="px-3 sm:px-6 pb-2 flex-1 min-h-0 bg-white">
                      <div className="max-w-3xl mx-auto space-y-2 py-2">
                        {filteredSuggestions.map((s) => (
                          <button
                            type="button"
                            key={s.text}
                            onClick={() => sendToChat(s.text)}
                            className="w-full flex items-start gap-2 sm:gap-3 text-left rounded-xl border border-black/[0.1] bg-bg px-3 sm:px-3.5 py-2.5 sm:py-3 hover:border-accent hover:bg-accent-lt cursor-pointer transition-all min-w-0"
                          >
                            <span className="shrink-0 mt-0.5 text-text1 flex items-center justify-center">
                              <CatalogIcon name={s.icon} size={18} />
                            </span>
                            <span className="text-[0.78rem] sm:text-[0.82rem] text-text2 leading-snug min-w-0 flex-1 break-words">{s.text}</span>
                            <FiChevronRight className="shrink-0 text-text3 mt-0.5 sm:mt-1" size={14} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-6 py-2 border-t border-black/[0.08] bg-white shrink-0">
                      <button
                        type="button"
                        onClick={() => setAppsDrawerOpen(true)}
                        className="inline-flex items-center gap-1 text-[0.75rem] sm:text-[0.78rem] text-text2 hover:text-accent cursor-pointer bg-transparent border-none font-instrument font-medium min-w-0"
                      >
                        {t('agents.view_all_suggestions')}
                        <FiChevronRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={shuffleSuggestions}
                        className="inline-flex items-center gap-1.5 text-[0.75rem] sm:text-[0.78rem] text-text2 hover:text-accent cursor-pointer bg-transparent border-none font-instrument font-medium shrink-0"
                      >
                        <FiShuffle size={13} />
                        {t('agents.shuffle')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Template strip (always visible under main / library content area) */}
            <div className="border-t border-black/[0.08] bg-bg shrink-0 max-h-[min(32dvh,220px)] sm:max-h-[220px] flex flex-col min-h-0">
              <div className="flex items-center gap-2 px-3 sm:px-4 pt-2 sm:pt-3 pb-1 shrink-0">
                <span className="font-syne text-[0.68rem] sm:text-[0.72rem] font-bold text-text3 uppercase tracking-[0.06em]">{t('agents.templates_label')}</span>
                <span className="text-[0.62rem] sm:text-[0.65rem] bg-bg2 text-text3 px-1.5 py-0.5 rounded">{tplForGrid.length}</span>
              </div>
              <div className="overflow-x-auto px-2 sm:px-3 pb-2 sm:pb-3 flex gap-2 sm:gap-2.5 scrollbar-none snap-x snap-mandatory touch-pan-x">
                {templatesPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} width={200} height={100} borderRadius={12} className="shrink-0 snap-start w-[min(200px,78vw)]" />
                    ))
                  : tplForGrid.slice(0, 8).map((tmpl) => (
                      <motion.button
                        type="button"
                        key={tmpl.title}
                        whileHover={{ y: -2 }}
                        onClick={() => startFromTemplate(tmpl)}
                        className="shrink-0 snap-start w-[min(12.5rem,78vw)] sm:w-[200px] text-left bg-white border border-black/[0.08] rounded-xl p-2.5 sm:p-3 hover:border-accent/25 cursor-pointer transition-all shadow-sm min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CatalogIcon name={tmpl.icon} size={18} className="text-text1 shrink-0" />
                          <span className="font-syne font-semibold text-[0.75rem] text-text1 truncate">{tmpl.title}</span>
                        </div>
                        <p className="text-[0.65rem] text-text2 line-clamp-2 leading-snug">{tmpl.desc}</p>
                      </motion.button>
                    ))}
                <motion.button
                  type="button"
                  whileHover={{ background: 'rgba(200,98,42,0.1)' }}
                  onClick={handleScratchCard}
                  className="shrink-0 snap-start w-[min(7rem,22vw)] sm:w-[140px] min-w-[5.5rem] rounded-xl border-[1.5px] border-dashed border-accent/30 bg-accent-lt flex flex-col items-center justify-center p-2.5 sm:p-3 cursor-pointer"
                >
                  <span className="text-xl">+</span>
                  <span className="text-[0.72rem] font-semibold text-accent text-center">Scratch</span>
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>

      <AgentBuilder />
    </div>
  );
}
