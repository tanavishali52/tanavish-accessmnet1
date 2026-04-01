'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  closeBuilder, setBuilderStep, setDraft, toggleTool,
  applyTemplate, setRunResult, setRunLoading, addAgent, updateAgent,
  BuilderStep,
} from '@/store/agentSlice';
import { showToast } from '@/store/appSlice';
import { apiCreateAgent, apiUpdateAgent, apiRunAgent, Model } from '@/lib/api';
import { FiX, FiArrowRight, FiArrowLeft, FiCheck, FiPlay, FiZap } from 'react-icons/fi';
import Skeleton from '@/components/shared/Skeleton';

const STEPS: { id: BuilderStep; label: string; desc: string }[] = [
  { id: 'template',  label: 'Template',  desc: 'Pick a starting point' },
  { id: 'configure', label: 'Configure', desc: 'Name, model & tools'   },
  { id: 'test',      label: 'Test',      desc: 'Run a trial message'   },
  { id: 'deploy',    label: 'Deploy',    desc: 'Save & activate'       },
];

const TOOLS = [
  { id: 'web_search',       icon: '🔍', label: 'Web Search',        desc: 'Search the internet in real time'          },
  { id: 'code_interpreter', icon: '💻', label: 'Code Interpreter',  desc: 'Execute and debug code automatically'      },
  { id: 'file_access',      icon: '📂', label: 'File Access',       desc: 'Read and write files & documents'          },
  { id: 'api_calls',        icon: '🔗', label: 'API Calls',         desc: 'Connect to external REST APIs'             },
  { id: 'memory',           icon: '🧠', label: 'Memory',            desc: 'Remember context across conversations'     },
  { id: 'scheduler',        icon: '⏰', label: 'Scheduler',         desc: 'Run tasks on a timed schedule'             },
];

export default function AgentBuilder() {
  const dispatch  = useDispatch();
  const { builderOpen, builderStep, draft, editingId, runResult, runLoading } = useSelector((s: RootState) => s.agent);
  const { items: catalog } = useSelector((s: RootState) => s.models);

  const [testMsg, setTestMsg] = useState('');
  const [saving,  setSaving]  = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === builderStep);

  /* ── helpers ── */
  const canNext = () => {
    if (builderStep === 'configure') return draft.name.trim().length >= 2 && draft.modelId;
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
      if (editingId) {
        const updated = await apiUpdateAgent(editingId, { ...draft, status: 'draft' });
        dispatch(updateAgent(updated));
      } else {
        const created = await apiCreateAgent({ ...draft, status: 'draft' });
        dispatch(addAgent(created));
        // patch editingId by going to test step — builder will now have the id
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
        const updated = await apiUpdateAgent(editingId, { status: 'active' });
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

  return (
    <AnimatePresence>
      {builderOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && dispatch(closeBuilder())}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full sm:max-w-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ borderRadius: '28px 28px 0 0', maxHeight: '92vh' }}
          >
            {/* Drag handle */}
            <div className="flex sm:hidden justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-black/[0.12] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-black/[0.08] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <FiZap size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-[1rem] text-text1" style={{ letterSpacing: '-0.02em' }}>
                    {editingId ? 'Edit Agent' : 'New Agent'}
                  </h2>
                  <p className="text-[0.7rem] text-text3">{STEPS[stepIndex]?.desc}</p>
                </div>
              </div>
              <button onClick={() => dispatch(closeBuilder())}
                className="w-8 h-8 rounded-full bg-bg2 flex items-center justify-center text-text2 hover:bg-bg3 transition-colors border-none cursor-pointer">
                <FiX size={15} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-5 sm:px-6 py-3 border-b border-black/[0.08] flex items-center gap-1 flex-shrink-0 overflow-x-auto">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.72rem] font-medium transition-all ${
                    i === stepIndex
                      ? 'bg-accent text-white'
                      : i < stepIndex
                        ? 'bg-green/15 text-green'
                        : 'bg-bg2 text-text3'
                  }`}>
                    {i < stepIndex ? <FiCheck size={11} /> : <span className="text-[0.65rem] font-bold">{i + 1}</span>}
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-4 h-px bg-black/[0.1]" />}
                </div>
              ))}
            </div>

            {/* Body */}
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
                {builderStep === 'test' && (
                  <motion.div key="test" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <TestStep
                      testMsg={testMsg} setTestMsg={setTestMsg}
                      runLoading={runLoading} runResult={runResult}
                      onTest={handleTest} hasId={!!editingId}
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

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-black/[0.08] flex items-center justify-between flex-shrink-0">
              <button
                onClick={builderStep === 'template' ? () => dispatch(closeBuilder()) : handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/[0.14] text-text2 text-[0.82rem] hover:border-accent hover:text-accent transition-all cursor-pointer bg-none font-instrument"
              >
                {builderStep === 'template' ? 'Cancel' : <><FiArrowLeft size={13} /> Back</>}
              </button>

              {builderStep === 'configure' ? (
                <button
                  onClick={handleSaveAndNext}
                  disabled={!canNext() || saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save & Test'} <FiArrowRight size={13} />
                </button>
              ) : builderStep === 'deploy' ? (
                <button
                  onClick={handleDeploy}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50"
                >
                  {saving ? 'Deploying…' : <><FiZap size={13} /> Deploy Agent</>}
                </button>
              ) : builderStep !== 'template' ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-[0.82rem] font-medium hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
                >
                  Next <FiArrowRight size={13} />
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Step panels ──────────────────────────────────────────────────────── */

function TemplateStep() {
  const dispatch = useDispatch();
  const { templates, status } = useSelector((s: RootState) => s.agent);

  return (
    <div>
      <p className="text-[0.82rem] text-text2 mb-4">Choose a template to pre-fill your agent, or start from scratch.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {status === 'loading' ? (
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
              whileHover={{ borderColor: '#C8622A', background: '#FDF9F7' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(applyTemplate({
                name: tmpl.title === 'Start from Scratch' ? '' : tmpl.title,
                description: tmpl.desc,
                modelId: tmpl.modelId,
                systemPrompt: tmpl.systemPrompt,
                tools: tmpl.tools,
              }))}
              className="flex items-start gap-3 p-3.5 border border-black/[0.1] rounded-xl text-left transition-all cursor-pointer bg-bg"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{tmpl.icon}</span>
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
      {/* Name */}
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Agent Name *</label>
        <input
          value={draft.name}
          onChange={(e) => dispatch(setDraft({ name: e.target.value }))}
          placeholder="e.g. My Research Agent"
          className="w-full px-3.5 py-2.5 text-[0.85rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Description</label>
        <input
          value={draft.description}
          onChange={(e) => dispatch(setDraft({ description: e.target.value }))}
          placeholder="What does this agent do?"
          className="w-full px-3.5 py-2.5 text-[0.85rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg"
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">Backbone Model *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {catalog.filter((m) => m.types.includes('language') || m.types.includes('code')).slice(0, 6).map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => dispatch(setDraft({ modelId: m.id }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[0.75rem] font-medium cursor-pointer transition-all ${
                draft.modelId === m.id
                  ? 'border-accent bg-accent-lt text-accent'
                  : 'border-black/[0.1] bg-bg text-text2 hover:border-accent/40'
              }`}
            >
              <span className="text-base flex-shrink-0">{m.icon}</span>
              <span className="truncate">{m.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* System prompt */}
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-1.5">System Prompt</label>
        <textarea
          value={draft.systemPrompt}
          onChange={(e) => dispatch(setDraft({ systemPrompt: e.target.value }))}
          placeholder="You are a helpful assistant that..."
          rows={4}
          className="w-full px-3.5 py-2.5 text-[0.82rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg resize-none leading-relaxed"
        />
      </div>

      {/* Tools */}
      <div>
        <label className="block text-[0.78rem] font-medium text-text2 mb-2">Tools & Capabilities</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TOOLS.map((tool) => {
            const active = draft.tools.includes(tool.id);
            return (
              <motion.button
                key={tool.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => dispatch(toggleTool(tool.id))}
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  active
                    ? 'border-accent bg-accent-lt'
                    : 'border-black/[0.1] bg-bg hover:border-accent/40'
                }`}
              >
                <span className="text-base flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className={`text-[0.72rem] font-semibold ${active ? 'text-accent' : 'text-text1'}`}>{tool.label}</div>
                  <div className="text-[0.65rem] text-text3 leading-tight">{tool.desc}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TestStep({
  testMsg, setTestMsg, runLoading, runResult, onTest, hasId,
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
        <span className="text-lg flex-shrink-0">✦</span>
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
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && hasId) { e.preventDefault(); onTest(); } }}
          placeholder={`Try: "Research the latest AI trends and write a summary"`}
          rows={3}
          disabled={!hasId}
          className="w-full px-3.5 py-2.5 text-[0.82rem] border border-black/[0.14] rounded-xl outline-none focus:border-accent font-instrument bg-bg resize-none disabled:opacity-50"
        />
      </div>

      <button
        onClick={onTest}
        disabled={!testMsg.trim() || runLoading || !hasId}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-[0.82rem] font-medium rounded-full hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument disabled:opacity-50"
      >
        {runLoading ? 'Running…' : <><FiPlay size={13} /> Run Agent</>}
      </button>

      {runResult && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="border border-black/[0.08] rounded-xl overflow-hidden">
          <div className="bg-bg px-4 py-2.5 border-b border-black/[0.08] flex items-center gap-2">
            <span className="text-sm">{runResult.model.icon}</span>
            <span className="text-[0.75rem] font-semibold text-text1">{runResult.model.name}</span>
            <span className="ml-auto text-[0.65rem] text-text3">{new Date(runResult.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="px-4 py-3">
            <div className="text-[0.72rem] text-text3 mb-1.5">Input: <span className="italic">"{runResult.input}"</span></div>
            <div className="text-[0.8rem] text-text1 leading-relaxed whitespace-pre-wrap">{runResult.output}</div>
            {runResult.toolsUsed.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {runResult.toolsUsed.map((t) => (
                  <span key={t} className="text-[0.65rem] bg-bg2 text-text2 px-2 py-0.5 rounded-full">{t}</span>
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

  const summary = [
    { label: 'Agent Name',  value: draft.name       || '—' },
    { label: 'Model',       value: model?.name      || draft.modelId },
    { label: 'Tools',       value: draft.tools.length > 0 ? draft.tools.join(', ') : 'None' },
    { label: 'System Prompt', value: draft.systemPrompt ? `${draft.systemPrompt.slice(0, 60)}…` : 'None set' },
    { label: 'Status',      value: editingId ? 'Update existing' : 'Create new' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-bg border border-black/[0.08] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: model?.bg ?? '#EEF2FD' }}>
              {model?.icon ?? '🤖'}
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
              <span className="text-[0.75rem] text-text1 font-medium text-right">{s.value}</span>
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
