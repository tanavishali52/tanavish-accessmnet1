'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { closeModal, setModalTab, ModalTab } from '@/store/modalSlice';
import { openApp } from '@/store/appSlice';
import { setCurrentModelId } from '@/store/chatSlice';
import { FiX, FiZap, FiCopy, FiCpu, FiGlobe, FiSearch, FiFileText, FiCheck } from 'react-icons/fi';
import { useState } from 'react';

const TABS: { id: ModalTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'guide',    label: 'How to Use' },
  { id: 'pricing',  label: 'Pricing' },
  { id: 'prompt',   label: 'Prompt Guide' },
  { id: 'agent',    label: 'Agents' },
  { id: 'reviews',  label: 'Reviews' },
  { id: 'create-agent', label: 'Create Agent' },
];

export default function ModelModal() {
  const dispatch = useDispatch();
  const { isOpen, activeModel, activeTab } = useSelector((s: RootState) => s.modal);
  const models = useSelector((s: RootState) => s.models.items);
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
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-[12px] sm:rounded-[14px] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                style={{ background: activeModel.bg }}
              >
                {activeModel.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-syne text-[1.1rem] sm:text-[1.4rem] font-bold text-text1 leading-tight" style={{ letterSpacing: '-0.03em' }}>
                  {activeTab === 'create-agent' ? 'Configure New Agent' : activeModel.name}
                </h2>
                <p className="text-[0.75rem] sm:text-[0.82rem] text-text2 truncate">
                  {activeTab === 'create-agent' ? `Developing an agent using ${activeModel.name}` : `by ${activeModel.org} · ${activeModel.tags[0]}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {activeTab !== 'create-agent' && (
                  <button
                    onClick={handleTryNow}
                    className="flex items-center gap-1 sm:gap-1.5 bg-accent text-white text-[0.75rem] sm:text-[0.82rem] font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument"
                  >
                    <FiZap size={12} /> Try
                  </button>
                )}
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
              {activeTab === 'create-agent' && <CreateAgentForm initialModel={activeModel} models={models} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Tab panels ─────────────────────────────────────────────── */

function CreateAgentForm({ initialModel, models }: { initialModel: M; models: M[] }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    instructions: '',
    modelId: initialModel.id,
    tools: {
      search: true,
      coder: false,
      files: true,
    }
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(closeModal());
      dispatch(openApp('chat'));
      // Simulate agent message
      setTimeout(() => {
        // Here we would normally trigger the chat logic to start with the agent
      }, 500);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6 font-instrument">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text3 ml-1">Agent Name</label>
          <input
            type="text"
            placeholder="e.g. Research Analyst"
            className="w-full px-4 py-3 bg-bg border border-black/[0.1] rounded-xl outline-none focus:border-accent transition-all text-sm font-instrument"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text3 ml-1">Primary Goal</label>
          <input
            type="text"
            placeholder="e.g. Track market trends"
            className="w-full px-4 py-3 bg-bg border border-black/[0.1] rounded-xl outline-none focus:border-accent transition-all text-sm font-instrument"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text3 ml-1">Backbone Model</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {models.slice(0, 6).map((m) => (
            <button
              key={m.id}
              onClick={() => setFormData({ ...formData, modelId: m.id })}
              className={`flex items-center gap-2 p-2 border rounded-xl transition-all cursor-pointer text-left font-instrument ${
                formData.modelId === m.id ? 'border-accent bg-accent-lt' : 'border-black/[0.08] bg-white hover:border-black/[0.15]'
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span className="text-[0.75rem] font-medium truncate">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text3 ml-1">System Instructions</label>
        <textarea
          rows={4}
          placeholder="Detailed personality, behavioral constraints, and expertise guidelines..."
          className="w-full px-4 py-3 bg-bg border border-black/[0.1] rounded-xl outline-none focus:border-accent transition-all text-sm font-instrument resize-none"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <label className="text-[0.7rem] font-bold uppercase tracking-wider text-text3 ml-1">Agent Capabilities</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'search', label: 'Web Search', icon: <FiSearch />, desc: 'Real-time browsing' },
            { id: 'coder', label: 'Code Interpreter', icon: <FiCpu />, desc: 'Solve math & logic' },
            { id: 'files', label: 'File Analysis', icon: <FiFileText />, desc: 'Extract data' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setFormData({
                ...formData,
                tools: { ...formData.tools, [tool.id]: !formData.tools[tool.id as keyof typeof formData.tools] }
              })}
              className={`flex flex-col items-start p-3 border rounded-xl transition-all cursor-pointer font-instrument text-left ${
                formData.tools[tool.id as keyof typeof formData.tools] ? 'border-accent bg-accent-lt' : 'border-black/[0.08] bg-white hover:border-black/[0.15]'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-2 ${formData.tools[tool.id as keyof typeof formData.tools] ? 'bg-accent text-white' : 'bg-bg2 text-text3'}`}>
                {tool.icon}
              </div>
              <div className="text-[0.78rem] font-semibold text-text1">{tool.label}</div>
              <div className="text-[0.62rem] text-text3 leading-tight">{tool.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleCreate}
          disabled={loading || !formData.name}
          className={`w-full py-3.5 rounded-xl text-white font-syne font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
            loading || !formData.name ? 'bg-black/[0.2] cursor-not-allowed' : 'bg-accent hover:bg-accent2 shadow-lg shadow-accent/20'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Deploy Agent <FiCheck /></>
          )}
        </button>
      </div>
    </div>
  );
}

type M = NonNullable<RootState['modal']['activeModel']>;

function OverviewTab({ model }: { model: M }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-[0.82rem] sm:text-[0.9rem] text-text2 leading-relaxed">{model.desc}</p>
      {/* Stats — 3 col grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Rating',  value: `${model.rating} ⭐` },
          { label: 'Reviews', value: `${(model.reviews / 1000).toFixed(1)}k` },
          { label: 'Price',   value: model.price.split('/')[0] },
        ].map((s) => (
          <div key={s.label} className="bg-bg rounded-sm p-2.5 sm:p-3 text-center border border-black/[0.08]">
            <div className="font-semibold text-text1 text-[0.85rem] sm:text-sm">{s.value}</div>
            <div className="text-[0.62rem] sm:text-[0.68rem] text-text3 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Tags */}
      <div>
        <h4 className="font-syne font-semibold text-[0.82rem] sm:text-sm mb-2 sm:mb-3">Capabilities</h4>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {model.tags.map((tag: string) => (
            <span key={tag} className="bg-bg2 text-text2 text-[0.68rem] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      {/* Use cases */}
      <div className="bg-accent-lt border border-accent/25 rounded-sm p-3 sm:p-4">
        <h4 className="font-semibold text-[0.82rem] sm:text-sm text-accent mb-2">Example Use Cases</h4>
        <ul className="space-y-1">
          {['Content generation & summarisation', 'Code assistance & debugging', 'Data analysis & insights', 'Customer support automation'].map((u) => (
            <li key={u} className="text-[0.75rem] sm:text-[0.82rem] text-text2 flex items-start gap-2">
              <span className="text-accent flex-shrink-0 mt-0.5">✓</span> {u}
            </li>
          ))}
        </ul>
      </div>
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
        <div key={s.n} className="flex gap-2.5 sm:gap-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent text-white text-[0.7rem] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.n}</div>
          <div>
            <div className="font-semibold text-[0.82rem] sm:text-sm text-text1 mb-0.5">{s.title}</div>
            <div className="text-[0.75rem] sm:text-[0.82rem] text-text2">{s.desc}</div>
          </div>
        </div>
      ))}
      <div className="bg-text1 text-white rounded-sm p-3 sm:p-4 font-mono text-[0.68rem] sm:text-xs leading-relaxed mt-2 overflow-x-auto">
        <div className="text-text3 mb-1"># Quick start</div>
        <div><span className="text-blue-300">import</span> openai</div>
        <div className="mt-1">client = openai.OpenAI()</div>
        <div className="mt-1">response = client.chat.completions.create(</div>
        <div className="ml-3">model=<span className="text-green-300">&quot;{model.id}&quot;</span>,</div>
        <div className="ml-3">messages=[&#123;<span className="text-yellow-300">&quot;role&quot;</span>: <span className="text-green-300">&quot;user&quot;</span>, <span className="text-yellow-300">&quot;content&quot;</span>: <span className="text-green-300">&quot;Hello!&quot;</span>&#125;]</div>
        <div>)</div>
      </div>
    </div>
  );
}

function PricingTab({ model }: { model: M }) {
  const tiers = [
    { name: 'Pay-per-use',    price: model.price.split('/')[0], features: ['No commitment', 'Scale instantly', 'Standard limits', 'Community support'] },
    { name: 'Pro',            price: '$99/mo', features: ['Higher rate limits', 'Priority access', '10% discount', 'Email support'], highlighted: true },
    { name: 'Enterprise',     price: 'Custom', features: ['Unlimited scale', 'Dedicated infra', 'SLA guarantees', '24/7 support'] },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {tiers.map((t) => (
        <div key={t.name} className={`rounded-sm p-4 sm:p-5 border ${t.highlighted ? 'border-accent bg-accent-lt' : 'border-black/[0.08] bg-bg'}`}>
          <div className="font-syne font-semibold text-[0.85rem] sm:text-sm mb-1">{t.name}</div>
          <div className="text-xl sm:text-2xl font-bold text-text1 mb-2 sm:mb-3">{t.price}</div>
          <ul className="space-y-1 sm:space-y-1.5">
            {t.features.map((f) => (
              <li key={f} className="text-[0.72rem] sm:text-[0.78rem] text-text2 flex items-center gap-1.5">
                <span className="text-teal flex-shrink-0">✓</span> {f}
              </li>
            ))}
          </ul>
          <button className={`mt-3 sm:mt-4 w-full py-2 rounded-full text-[0.75rem] sm:text-xs font-medium transition-colors cursor-pointer font-instrument ${t.highlighted ? 'bg-accent text-white hover:bg-accent2 border-none' : 'bg-white border border-black/[0.14] text-text2 hover:border-accent hover:text-accent'}`}>
            {t.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
          </button>
        </div>
      ))}
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
    <div className="space-y-3 sm:space-y-5">
      {tips.map((tip) => (
        <div key={tip.title} className="border border-black/[0.08] rounded-sm p-3 sm:p-4">
          <h4 className="font-semibold text-[0.82rem] sm:text-sm text-text1 mb-1">{tip.title}</h4>
          <p className="text-[0.75rem] sm:text-[0.8rem] text-text2 mb-2 sm:mb-3">{tip.desc}</p>
          <div className="bg-bg2 rounded px-2.5 sm:px-3 py-2 flex items-start justify-between gap-2">
            <p className="text-[0.7rem] sm:text-[0.75rem] text-text2 italic flex-1">{tip.example}</p>
            <button className="text-text3 hover:text-accent flex-shrink-0 mt-0.5"><FiCopy size={12} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentTab({ model }: { model: M }) {
  const steps = [
    "Define your agent's goal and the tasks it should autonomously complete",
    `Choose ${model.name} as the backbone — it excels at complex instructions`,
    'Configure tools: web search, code interpreter, file access, or custom APIs',
    'Write a detailed system prompt defining persona, capabilities, and constraints',
    'Test with edge cases: ambiguous inputs, failures, and multi-step tasks',
    'Deploy with monitoring — track token usage, completion rate, and errors',
  ];
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-accent-lt border border-accent/25 rounded-sm p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
        <span className="text-xl sm:text-2xl flex-shrink-0">✦</span>
        <div>
          <div className="font-semibold text-[0.82rem] sm:text-sm text-accent mb-0.5">{model.name} is great for agents</div>
          <div className="text-[0.72rem] sm:text-[0.8rem] text-text2">Strong instruction-following, long context, and reliable tool use.</div>
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={i} className="flex gap-2.5 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-bg2 text-text2 text-[0.65rem] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
          <p className="text-[0.75rem] sm:text-[0.83rem] text-text2 leading-relaxed">{s}</p>
        </div>
      ))}
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
    <div>
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-bg rounded-sm border border-black/[0.08]">
        <div className="text-center flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-bold font-syne text-text1">{model.rating}</div>
          <div className="flex text-amber-400 text-xs sm:text-sm mt-0.5">{'★'.repeat(Math.round(model.rating))}</div>
          <div className="text-[0.62rem] sm:text-xs text-text3 mt-0.5">{(model.reviews / 1000).toFixed(1)}k reviews</div>
        </div>
        <div className="flex-1 space-y-1 sm:space-y-1.5">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[0.62rem] text-text3 w-2">{n}</span>
              <div className="flex-1 bg-bg2 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${n === 5 ? 70 : n === 4 ? 20 : n === 3 ? 7 : 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="border border-black/[0.08] rounded-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent text-white text-[0.65rem] sm:text-xs font-bold flex items-center justify-center flex-shrink-0">{r.user[0]}</div>
              <div>
                <div className="text-[0.8rem] sm:text-sm font-medium text-text1">{r.user}</div>
                <div className="text-[0.62rem] sm:text-[0.68rem] text-text3">{r.date}</div>
              </div>
              <div className="ml-auto flex text-amber-400 text-[0.7rem] sm:text-xs">{'★'.repeat(r.rating)}</div>
            </div>
            <p className="text-[0.75rem] sm:text-[0.82rem] text-text2 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
