'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  closeBuilder,
  setBuilderStep,
  setDraft,
  toggleTool,
  applyTemplate,
  setRunResult,
  setRunLoading,
  addAgent,
  updateAgent,
  setEditingId,
  BuilderStep,
  AgentMemoryMode,
} from '@/store/agentSlice';
import { showToast } from '@/store/appSlice';
import { apiCreateAgent, apiUpdateAgent, apiRunAgent, Model } from '@/lib/api';
import {
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiPlay,
  FiZap,
  FiStar,
  FiSearch,
  FiCpu,
  FiSlash,
  FiMessageCircle,
  FiBook,
  FiPlus,
  FiChevronRight,
  FiMail,
  FiCalendar,
  FiDatabase,
  FiLink,
  FiGrid,
  FiLayers,
} from 'react-icons/fi';
import Skeleton from '@/components/shared/Skeleton';
import { CatalogIcon } from '@/components/shared/CatalogIcon';

const STEPS: { id: BuilderStep; label: string; desc: string }[] = [
  { id: 'template', label: 'Purpose', desc: 'Pick a starting point' },
  { id: 'configure', label: 'Basics', desc: 'Name, model & description' },
  { id: 'system_prompt', label: 'System Prompt', desc: 'Instructions for your agent' },
  { id: 'tools_apis', label: 'Tools & APIs', desc: 'Connect capabilities' },
  { id: 'memory', label: 'Memory', desc: 'Session & long-term recall' },
  { id: 'test', label: 'Test', desc: 'Run a trial message' },
  { id: 'deploy', label: 'Deploy', desc: 'Save & activate' },
];

type ToolFilter = 'all' | 'connected' | 'available' | 'suggested';

const TOOLS_APIS: {
  id: string;
  icon: string;
  label: string;
  desc: string;
  category: string;
}[] = [
  {
    id: 'web_search',
    icon: 'FiSearch',
    label: 'Web Search',
    desc: 'Search the public web for up-to-date information.',
    category: 'Data',
  },
  {
    id: 'database_lookup',
    icon: 'FiDatabase',
    label: 'Database Lookup',
    desc: 'Query SQL or NoSQL data sources with guardrails.',
    category: 'Data',
  },
  {
    id: 'email_sender',
    icon: 'FiMail',
    label: 'Email Sender',
    desc: 'Send transactional or draft emails via your provider.',
    category: 'Comms',
  },
  {
    id: 'calendar_api',
    icon: 'FiCalendar',
    label: 'Calendar API',
    desc: 'Read availability and create events on connected calendars.',
    category: 'Comms',
  },
  {
    id: 'slack_webhook',
    icon: 'FiMessageCircle',
    label: 'Slack Webhook',
    desc: 'Post messages and alerts to Slack channels.',
    category: 'Comms',
  },
  {
    id: 'jira',
    icon: 'FiLayers',
    label: 'Jira',
    desc: 'Create and transition issues from conversation context.',
    category: 'Productivity',
  },
  {
    id: 'google_sheets',
    icon: 'FiGrid',
    label: 'Google Sheets',
    desc: 'Read and append structured rows to spreadsheets.',
    category: 'Data',
  },
  {
    id: 'custom_function',
    icon: 'FiZap',
    label: 'Custom Function',
    desc: 'Register JSON-schema tools for model function calling.',
    category: 'Developer',
  },
  {
    id: 'code_interpreter',
    icon: 'FiCpu',
    label: 'Code Interpreter',
    desc: 'Execute and debug code in a sandboxed environment.',
    category: 'Developer',
  },
  {
    id: 'file_access',
    icon: 'FiCpu',
    label: 'File Access',
    desc: 'Read and write project files and documents.',
    category: 'Developer',
  },
  {
    id: 'api_calls',
    icon: 'FiLink',
    label: 'API Calls',
    desc: 'Call authenticated REST endpoints with stored secrets.',
    category: 'Developer',
  },
  {
    id: 'scheduler',
    icon: 'FiCalendar',
    label: 'Scheduler',
    desc: 'Schedule deferred runs and recurring agent tasks.',
    category: 'Productivity',
  },
];

const MEMORY_OPTIONS: {
  id: AgentMemoryMode;
  icon: React.ReactNode;
  title: string;
  desc: string;
}[] = [
  {
    id: 'none',
    icon: <FiSlash size={22} className="text-text3" />,
    title: 'No Memory',
    desc: 'Stateless — each conversation starts fresh. Best for simple Q&A agents.',
  },
  {
    id: 'short_term',
    icon: <FiMessageCircle size={22} className="text-accent" />,
    title: 'Short-term Only',
    desc: 'Maintains conversation history within a session. Forgets after the session ends.',
  },
  {
    id: 'short_and_long_term',
    icon: <FiBook size={22} className="text-blue" />,
    title: 'Short + Long-term',
    desc: 'Persists key facts and preferences to a vector store across all sessions.',
  },
];

export default function AgentBuilder() {
  const dispatch = useDispatch();
  const { builderOpen, builderStep, draft, editingId, runResult, runLoading } = useSelector(
    (s: RootState) => s.agent,
  );
  const { items: catalog } = useSelector((s: RootState) => s.models);

  const [testMsg, setTestMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [toolFilter, setToolFilter] = useState<ToolFilter>('all');
  const [toolCategory, setToolCategory] = useState<string>('all');

  const stepIndex = STEPS.findIndex((s) => s.id === builderStep);

  const canNext = () => {
    if (builderStep === 'configure') return draft.name.trim().length >= 2 && Boolean(draft.modelId);
    return true;
  };

  const handleNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) dispatch(setBuilderStep(next.id));
  };

  const handleBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) dispatch(setBuilderStep(prev.id));
  };

  const handleTest = async () => {
    if (!testMsg.trim() || !editingId) return;
    dispatch(setRunLoading(true));
    try {
      const result = await apiRunAgent(editingId, testMsg.trim());
      dispatch(setRunResult(result));
    } catch {
      dispatch(showToast('Test failed — make sure the agent is saved first.'));
    } finally {
      dispatch(setRunLoading(false));
    }
  };

  const handleSaveAndNext = async () => {
    setSaving(true);
    try {
      const payload = {
        name: draft.name,
        description: draft.description,
        modelId: draft.modelId,
        systemPrompt: draft.systemPrompt,
        tools: draft.tools,
        memoryMode: draft.memoryMode,
        status: 'draft' as const,
      };
      if (editingId) {
        const updated = await apiUpdateAgent(editingId, payload);
        dispatch(updateAgent(updated));
      } else {
        const created = await apiCreateAgent(payload);
        dispatch(addAgent(created));
        dispatch(setEditingId(created._id));
      }
      dispatch(setBuilderStep('test'));
    } catch {
      dispatch(showToast('Failed to save agent. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiUpdateAgent(editingId, {
          name: draft.name,
          description: draft.description,
          modelId: draft.modelId,
          systemPrompt: draft.systemPrompt,
          tools: draft.tools,
          memoryMode: draft.memoryMode,
          status: 'active',
        });
        dispatch(updateAgent(updated));
      }
      dispatch(showToast('Agent deployed successfully!'));
      dispatch(closeBuilder());
    } catch {
      dispatch(showToast('Deploy failed. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const visibleTools = TOOLS_APIS.filter((t) => {
    if (toolCategory !== 'all' && t.category !== toolCategory) return false;
    if (toolFilter === 'connected') return draft.tools.includes(t.id);
    if (toolFilter === 'available') return !draft.tools.includes(t.id);
    if (toolFilter === 'suggested') return ['web_search', 'slack_webhook', 'code_interpreter'].includes(t.id);
    return true;
  });

  const categories = ['all', ...Array.from(new Set(TOOLS_APIS.map((x) => x.category)))];

  return (
    <AnimatePresence>
      {builderOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && dispatch(closeBuilder())}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full sm:max-w-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ borderRadius: '28px 28px 0 0', maxHeight: '92vh' }}
          >
            <div className="flex sm:hidden justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-black/[0.12] rounded-full" />
            </div>

            <div className="px-5 sm:px-6 py-4 border-b border-black/[0.08] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                  <FiZap size={15} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-syne font-bold text-[1rem] text-text1 truncate" style={{ letterSpacing: '-0.02em' }}>
                    {editingId ? 'Edit Agent' : 'New Agent'}
                  </h2>
                  <p className="text-[0.7rem] text-text3 truncate">
                    Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex]?.desc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeBuilder())}
                className="w-8 h-8 rounded-full bg-bg2 flex items-center justify-center text-text2 hover:bg-bg3 transition-colors border-none cursor-pointer shrink-0"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-3 border-b border-black/[0.08] flex items-center gap-1 flex-shrink-0 overflow-x-auto scrollbar-none">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[0.68rem] sm:text-[0.72rem] font-medium transition-all whitespace-nowrap ${
                      i === stepIndex
                        ? 'bg-accent text-white'
                        : i < stepIndex
                          ? 'bg-green/15 text-green'
                          : 'bg-bg2 text-text3'
                    }`}
                  >
                    {i < stepIndex ? <FiCheck size={11} /> : <span className="text-[0.65rem] font-bold">{i + 1}</span>}
                    <span className="hidden min-[400px]:inline sm:inline">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="w-3 sm:w-4 h-px bg-black/[0.1] shrink-0" />}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <AnimatePresence mode="wait">
                {builderStep === 'template' && (
                  <motion.div key="template" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <TemplateStep />
                  </motion.div>
                )}
                {builderStep === 'configure' && (
                  <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <ConfigureStep catalog={catalog} />
                  </motion.div>
                )}
                {builderStep === 'system_prompt' && (
                  <motion.div key="system_prompt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <SystemPromptStep />
                  </motion.div>
                )}
                {builderStep === 'tools_apis' && (
                  <motion.div key="tools_apis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <ToolsApisStep
                      toolFilter={toolFilter}
                      setToolFilter={setToolFilter}
                      toolCategory={toolCategory}
                      setToolCategory={setToolCategory}
                      categories={categories}
                      visibleTools={visibleTools}
                    />
                  </motion.div>
                )}
                {builderStep === 'memory' && (
                  <motion.div key="memory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <MemoryStep />
                  </motion.div>
                )}
                {builderStep === 'test' && (
                  <motion.div key="test" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <TestStep
                      testMsg={testMsg}
                      setTestMsg={setTestMsg}
                      runLoading={runLoading}
                      runResult={runResult}
                      onTest={handleTest}
                      hasId={!!editingId}
                    />
                  </motion.div>
                )}
                {builderStep === 'deploy' && (
                  <motion.div key="deploy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <DeployStep catalog={catalog} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-black/[0.08] flex items-center justify-between flex-shrink-0 gap-2">
              <button
                type="button"
                onClick={builderStep === 'template' ? () => dispatch(closeBuilder()) : handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/[0.14] text-text2 text-[0.82rem] hover:border-accent hover:text-accent transition-all cursor-pointer bg-none font-instrument shrink-0"
              >
                {builderStep === 'template' ? 'Cancel' : (
                  <>
                    <FiArrowLeft size={13} /> Back
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 justify-center flex-1 min-w-0 overflow-hidden">
                {STEPS.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-accent' : 'w-1.5 bg-black/[0.12]'}`}
                  />
                ))}
              </div>

              {builderStep === 'template' ? null : builderStep === 'memory' ? (
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  disabled={!canNext() || saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50 shrink-0"
                >
                  {saving ? 'Saving…' : (
                    <>
                      Save & Test <FiArrowRight size={13} />
                    </>
                  )}
                </button>
              ) : builderStep === 'deploy' ? (
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50 shrink-0"
                >
                  {saving ? 'Deploying…' : (
                    <>
                      <FiZap size={13} /> Deploy
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50 shrink-0"
                >
                  Next <FiArrowRight size={13} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TemplateStep() {
  const dispatch = useDispatch();
  const { templates, status } = useSelector((s: RootState) => s.agent);
  const templatesPending = status === 'loading' || (status === 'idle' && templates.length === 0);

  return (
    <div>
      <p className="text-[0.82rem] text-text2 mb-4">Choose a template to pre-fill your agent, or start from scratch.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {templatesPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 border border-black/[0.1] rounded-xl bg-bg h-[70px]">
              <Skeleton width={24} height={24} borderRadius={6} />
              <div className="flex-1 space-y-1.5">
                <Skeleton width="60%" height="0.8rem" />
                <Skeleton width="90%" height="0.65rem" />
              </div>
            </div>
          ))
        ) : (
          templates.map((tmpl) => (
            <motion.button
              key={tmpl.title}
              type="button"
              whileHover={{ borderColor: '#C8622A', background: '#FDF9F7' }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                dispatch(
                  applyTemplate({
                    name: tmpl.title === 'Start from Scratch' ? '' : tmpl.title,
                    description: tmpl.desc,
                    modelId: tmpl.modelId,
                    systemPrompt: tmpl.systemPrompt,
                    tools: tmpl.tools,
                  }),
                )
              }
              className="flex items-start gap-3 p-3.5 border border-black/[0.1] rounded-xl text-left transition-all cursor-pointer bg-bg"
            >
              <span className="flex-shrink-0 mt-0.5 text-text1">
                <CatalogIcon name={tmpl.icon} size={22} />
              </span>
              <div className="min-w-0">
                <div className="text-[0.82rem] font-semibold text-text1 mb-0.5">{tmpl.title}</div>
                <div className="text-[0.72rem] text-text2 leading-snug">{tmpl.desc}</div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}

function ConfigureStep({ catalog }: { catalog: Model[] }) {
  const dispatch = useDispatch();
  const { draft } = useSelector((s: RootState) => s.agent);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Agent Name *</label>
        <input
          value={draft.name}
          onChange={(e) => dispatch(setDraft({ name: e.target.value }))}
          placeholder="e.g. My Research Agent"
          className="w-full px-3.5 py-2.5 text-[0.85rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg"
        />
      </div>

      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Description</label>
        <input
          value={draft.description}
          onChange={(e) => dispatch(setDraft({ description: e.target.value }))}
          placeholder="What does this agent do?"
          className="w-full px-3.5 py-2.5 text-[0.85rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg"
        />
      </div>

      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Backbone Model *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {catalog
            .filter((m) => (m.types ?? []).includes('language') || (m.types ?? []).includes('code'))
            .slice(0, 9)
            .map((m) => (
              <motion.button
                key={m.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => dispatch(setDraft({ modelId: m.id }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[0.75rem] font-medium cursor-pointer transition-all ${
                  draft.modelId === m.id
                    ? 'border-accent bg-accent-lt text-accent'
                    : 'border-black/[0.1] bg-bg text-text2 hover:border-accent/40'
                }`}
              >
                <CatalogIcon name={m.icon} size={18} className="flex-shrink-0 text-text1" />
                <span className="truncate">{m.name}</span>
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
}

function SystemPromptStep() {
  const dispatch = useDispatch();
  const { draft } = useSelector((s: RootState) => s.agent);

  return (
    <div className="space-y-3">
      <p className="text-[0.8rem] text-text2 leading-relaxed">
        Define how your agent behaves, what tone to use, and any rules it must follow.
      </p>
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">System Prompt</label>
        <textarea
          value={draft.systemPrompt}
          onChange={(e) => dispatch(setDraft({ systemPrompt: e.target.value }))}
          placeholder="You are a helpful assistant that..."
          rows={8}
          className="w-full px-3.5 py-2.5 text-[0.82rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg resize-none leading-relaxed min-h-[160px]"
        />
      </div>
    </div>
  );
}

function ToolsApisStep({
  toolFilter,
  setToolFilter,
  toolCategory,
  setToolCategory,
  categories,
  visibleTools,
}: {
  toolFilter: ToolFilter;
  setToolFilter: (f: ToolFilter) => void;
  toolCategory: string;
  setToolCategory: (c: string) => void;
  categories: string[];
  visibleTools: typeof TOOLS_APIS;
}) {
  const dispatch = useDispatch();
  const { draft } = useSelector((s: RootState) => s.agent);

  const filters: { id: ToolFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'connected', label: 'Connected' },
    { id: 'available', label: 'Available' },
    { id: 'suggested', label: 'Suggested' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[0.8rem] text-text2 leading-relaxed">
        Equip your agent with tools: web search, database lookup, email, calendar, webhooks, and more. Select the capabilities
        this agent should use.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setToolFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-[0.72rem] font-semibold border transition-all cursor-pointer font-instrument ${
                toolFilter === f.id
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg border-black/[0.1] text-text2 hover:border-accent/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] text-text3 whitespace-nowrap">Category</span>
          <select
            value={toolCategory}
            onChange={(e) => setToolCategory(e.target.value)}
            className="text-[0.75rem] border border-black/[0.14] rounded-lg px-2.5 py-1.5 bg-bg font-instrument outline-none focus:border-accent"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visibleTools.map((tool) => {
          const active = draft.tools.includes(tool.id);
          return (
            <div
              key={tool.id}
              className={`rounded-xl border text-left transition-all ${
                active ? 'border-accent bg-accent-lt/40' : 'border-black/[0.1] bg-bg hover:border-accent/30'
              }`}
            >
              <button
                type="button"
                onClick={() => dispatch(toggleTool(tool.id))}
                className="w-full p-3 flex gap-2.5 text-left cursor-pointer border-none bg-transparent rounded-t-xl"
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    active ? 'bg-accent border-accent' : 'border-black/[0.2] bg-white'
                  }`}
                >
                  {active ? <FiCheck size={10} className="text-white" /> : null}
                </span>
                <CatalogIcon name={tool.icon} size={20} className="flex-shrink-0 text-text1" />
                <div className="min-w-0 flex-1">
                  <div className={`text-[0.78rem] font-semibold ${active ? 'text-accent' : 'text-text1'}`}>{tool.label}</div>
                  <div className="text-[0.68rem] text-text3 leading-snug mt-0.5">{tool.desc}</div>
                </div>
              </button>
              <div className="flex items-center justify-between px-3 py-2 border-t border-black/[0.06] bg-white/60 rounded-b-xl text-[0.65rem] text-text3">
                <span>How to configure</span>
                <FiChevronRight size={14} className="text-accent" />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => dispatch(showToast('More integrations are coming soon.'))}
        className="w-full py-3 border-2 border-dashed border-accent/35 rounded-xl text-[0.78rem] font-medium text-accent hover:bg-accent-lt/50 transition-colors cursor-pointer font-instrument flex items-center justify-center gap-2 bg-transparent"
      >
        <FiPlus size={16} /> Add more tools
      </button>

      <div className="rounded-xl border border-sky-200/80 bg-sky-50/80 px-3.5 py-3 text-[0.72rem] text-text2 leading-relaxed">
        GPT-5.4, Claude Opus 4.6, Grok-4 and similar models support function calling — define tools in JSON schema and the model
        will invoke them when needed.
      </div>
    </div>
  );
}

function MemoryStep() {
  const dispatch = useDispatch();
  const { draft } = useSelector((s: RootState) => s.agent);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-syne font-bold text-[0.95rem] text-text1">Memory</h3>
        <p className="text-[0.78rem] text-text2 mt-1 leading-relaxed">
          Configure short-term (conversation history) and long-term memory (vector store). Let the agent remember user preferences
          across sessions.
        </p>
      </div>

      <div className="space-y-2.5">
        {MEMORY_OPTIONS.map((opt) => {
          const selected = draft.memoryMode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => dispatch(setDraft({ memoryMode: opt.id }))}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                selected
                  ? 'border-accent bg-accent-lt/50 shadow-sm'
                  : 'border-black/[0.1] bg-bg hover:border-accent/30'
              }`}
            >
              <div className="shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center">
                {opt.icon}
              </div>
              <div>
                <div className="text-[0.82rem] font-semibold text-text1">{opt.title}</div>
                <div className="text-[0.72rem] text-text2 leading-snug mt-0.5">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3 text-[0.72rem] text-text2 leading-relaxed">
        <span className="font-semibold text-amber">Pro tip: </span>
        Long-term memory uses a vector store (Pinecone, Weaviate, or NexusAI managed). Store preferences, past resolutions, and
        context summaries — not raw conversation logs.
      </div>
    </div>
  );
}

function TestStep({
  testMsg,
  setTestMsg,
  runLoading,
  runResult,
  onTest,
  hasId,
}: {
  testMsg: string;
  setTestMsg: (v: string) => void;
  runLoading: boolean;
  runResult: ReturnType<typeof useSelector<RootState, RootState['agent']['runResult']>>;
  onTest: () => void;
  hasId: boolean;
}) {
  const { draft } = useSelector((s: RootState) => s.agent);

  return (
    <div className="space-y-4">
      <div className="bg-accent-lt border border-accent/25 rounded-xl p-3.5 flex items-start gap-2.5">
        <FiStar size={18} className="flex-shrink-0 text-accent" strokeWidth={2} aria-hidden />
        <div>
          <div className="text-[0.82rem] font-semibold text-accent">Testing: {draft.name || 'Unnamed Agent'}</div>
          <div className="text-[0.72rem] text-text2 mt-0.5">
            {hasId ? 'Send a message to see how your agent responds.' : 'Save your agent on the previous step first to enable testing.'}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Test Message</label>
        <textarea
          value={testMsg}
          onChange={(e) => setTestMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && hasId) {
              e.preventDefault();
              onTest();
            }
          }}
          placeholder='Try: "Research the latest AI trends and write a summary"'
          rows={3}
          disabled={!hasId}
          className="w-full px-3.5 py-2.5 text-[0.82rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg resize-none disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        onClick={onTest}
        disabled={!testMsg.trim() || runLoading || !hasId}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-[0.82rem] font-medium rounded-full hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50"
      >
        {runLoading ? 'Running…' : (
          <>
            <FiPlay size={13} /> Run Agent
          </>
        )}
      </button>

      {runResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-black/[0.08] rounded-xl overflow-hidden"
        >
          <div className="bg-bg px-4 py-2.5 border-b border-black/[0.08] flex items-center gap-2">
            <CatalogIcon name={runResult.model.icon} size={16} className="text-text1" />
            <span className="text-[0.75rem] font-semibold text-text1">{runResult.model.name}</span>
            <span className="ml-auto text-[0.65rem] text-text3">{new Date(runResult.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="px-4 py-3">
            <div className="text-[0.72rem] text-text3 mb-1.5">
              Input:{' '}
              <span className="italic">
                {'\u201C'}
                {runResult.input}
                {'\u201D'}
              </span>
            </div>
            <div className="text-[0.8rem] text-text1 leading-relaxed whitespace-pre-wrap">{runResult.output}</div>
            {runResult.toolsUsed.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {runResult.toolsUsed.map((t) => (
                  <span key={t} className="text-[0.65rem] bg-bg2 text-text2 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function DeployStep({ catalog }: { catalog: Model[] }) {
  const { draft, editingId } = useSelector((s: RootState) => s.agent);
  const model = catalog.find((m) => m.id === draft.modelId);

  const memoryLabel =
    draft.memoryMode === 'none'
      ? 'No memory'
      : draft.memoryMode === 'short_and_long_term'
        ? 'Short + long-term'
        : 'Short-term only';

  const summary = [
    { label: 'Agent Name', value: draft.name || '—' },
    { label: 'Model', value: model?.name || draft.modelId },
    { label: 'Tools', value: draft.tools.length > 0 ? draft.tools.join(', ') : 'None' },
    { label: 'Memory', value: memoryLabel },
    { label: 'System Prompt', value: draft.systemPrompt ? `${draft.systemPrompt.slice(0, 60)}…` : 'None set' },
    { label: 'Status', value: editingId ? 'Update existing' : 'Create new' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-bg border border-black/[0.08] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-text1"
              style={{ background: model?.bg ?? '#EEF2FD' }}
            >
              <CatalogIcon name={model?.icon ?? 'FiCpu'} size={22} />
            </div>
            <div>
              <div className="font-syne font-bold text-[0.95rem] text-text1">{draft.name || 'Unnamed Agent'}</div>
              <div className="text-[0.72rem] text-text3">{draft.description || 'No description'}</div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-black/[0.06]">
          {summary.map((s) => (
            <div key={s.label} className="flex items-start justify-between px-4 py-2.5 gap-3">
              <span className="text-[0.75rem] text-text3 flex-shrink-0">{s.label}</span>
              <span className="text-[0.75rem] text-text1 font-medium text-right break-words">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green/10 border border-green/20 rounded-xl p-3.5 flex items-start gap-2.5">
        <FiCheck size={16} className="text-green flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[0.82rem] font-semibold text-green">Ready to deploy</div>
          <div className="text-[0.72rem] text-text2 mt-0.5">
            Clicking deploy will set this agent to <strong>Active</strong> and make it available in your agents list.
          </div>
        </div>
      </div>
    </div>
  );
}
