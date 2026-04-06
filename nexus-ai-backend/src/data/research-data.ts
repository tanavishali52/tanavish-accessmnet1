export interface ResearchEntry {
  id: string;
  date: string;
  org: string;
  title: string;
  summary: string;
  category: string;
  longDate: string;
  authorsLine: string;
  overview: string;
  metrics: { value: string; label: string }[];
  keyFindings: string[];
  modelsReferenced: { icon: string; name: string }[];
  impact: string;
  citation: string;
  arxivId?: string;
}

export const RESEARCH: ResearchEntry[] = [
  {
    id: 'gemini-25-pro-reasoning',
    date: 'Mar 26',
    org: 'Google DeepMind',
    title: 'Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks',
    summary:
      'Scores 83.2% on AIME 2025 math competition, outperforming all prior models on reasoning-intensive tasks.',
    category: 'REASONING',
    longDate: 'March 26, 2026',
    authorsLine: 'arXiv:2603.08821 | Anil, R., Borgeaud, S., Wu, Y., et al.',
    overview:
      'Gemini 2.5 Pro introduces iterative thought refinement with a 5M-token context window, delivering state-of-the-art results on math, code, and multi-step reasoning suites while improving calibration on long chains.',
    metrics: [
      { value: '83.2%', label: 'AIME 2026 score' },
      { value: '+6.4%', label: 'vs prior SOTA' },
      { value: '5M ctx', label: 'Context window' },
    ],
    keyFindings: [
      'Iterative Thought Refinement (ITR) reduces path errors on competition math by revisiting intermediate steps before final answers.',
      'Gemini 2.5 Pro ranks first on AIME, GPQA Diamond, and several code-generation leaderboards versus prior frontier models.',
      'Gains are largest on tasks requiring 8+ reasoning hops; shallow QA sees smaller but consistent lifts.',
      'Multimodal reasoning (charts + text) improves versus 2.0-series Gemini without sacrificing text-only scores.',
    ],
    modelsReferenced: [
      { icon: 'FiActivity', name: 'Gemini 2.5 Pro' },
      { icon: 'FiCpu', name: 'GPT-5' },
      { icon: 'FiAward', name: 'Claude Opus 4.6' },
      { icon: 'FiSettings', name: 'o3' },
    ],
    impact:
      'High — sets a new benchmark baseline for frontier model evaluations on reasoning-heavy workloads.',
    citation:
      'Anil, R., Borgeaud, S., Wu, Y., et al. (2026). Gemini 2.5 Pro: Reasoning at Frontier Scale. arXiv:2603.08821.',
    arxivId: '2603.08821',
  },
  {
    id: 'mit-multimodal-scaling',
    date: 'Mar 22',
    org: 'MIT CSAIL',
    title: 'Scaling laws for multimodal models: new empirical findings',
    summary:
      'Research reveals unexpected scaling dynamics when combining vision and language — efficiency gains plateau earlier than expected.',
    category: 'MULTIMODAL',
    longDate: 'March 22, 2026',
    authorsLine: 'Preprint | Chen, L., Matthews, J., et al.',
    overview:
      'Large-scale sweeps across paired image–text corpora show compute-optimal multimodal scaling diverges from text-only curves, with earlier diminishing returns as modalities are fused.',
    metrics: [
      { value: '12%', label: 'Earlier plateau vs text' },
      { value: '2.1×', label: 'Data mix sensitivity' },
      { value: '64', label: 'Configs evaluated' },
    ],
    keyFindings: [
      'Joint training consumes more FLOPs per quality gain once vision towers exceed a threshold size.',
      'Balanced batching between modalities outperforms naive proportional sampling for mid-scale budgets.',
      'Frozen encoders with tuned connectors can match partial finetuned stacks at lower cost.',
      'Calibration on vision QA degrades unless contrastive objectives are reweighted during scaling.',
    ],
    modelsReferenced: [
      { icon: 'FiActivity', name: 'Gemini 3 Flash' },
      { icon: 'FiPackage', name: 'Llama 4 Maverick' },
      { icon: 'FiCpu', name: 'GPT-5.4' },
    ],
    impact: 'Medium-high — informs how labs allocate multimodal training budgets.',
    citation:
      'Chen, L., Matthews, J., et al. (2026). Scaling Laws for Multimodal Foundation Models. MIT CSAIL Technical Report.',
  },
  {
    id: 'anthropic-constitutional-v2',
    date: 'Mar 18',
    org: 'Anthropic',
    title: 'Constitutional AI v2: improved alignment through iterative refinement',
    summary:
      'New methodology achieves 40% reduction in harmful outputs while preserving capability on standard benchmarks.',
    category: 'ALIGNMENT',
    longDate: 'March 18, 2026',
    authorsLine: 'Anthropic alignment team | Bai, Y., Kadavath, S., et al.',
    overview:
      'Constitutional AI v2 layers human feedback with automated critique loops, tightening refusals without broad capability regressions on MMLU-style tasks.',
    metrics: [
      { value: '−40%', label: 'Harmful outputs' },
      { value: '±0.8%', label: 'MMLU delta' },
      { value: '3 stages', label: 'Critique loop' },
    ],
    keyFindings: [
      'Iterative self-critique reduces jailbreak success rates versus single-pass RLHF.',
      'Capability preservation improves when capability audits run inline with safety updates.',
      'Smaller oversight models can steer larger actors if critique features are normalized.',
      'Transparency reports correlate stage-wise with measured harm metrics.',
    ],
    modelsReferenced: [
      { icon: 'FiAward', name: 'Claude Opus 4.6' },
      { icon: 'FiZap', name: 'Claude Sonnet 4.6' },
    ],
    impact: 'High — practical template for scalable alignment iterations.',
    citation:
      'Bai, Y., Kadavath, S., et al. (2026). Constitutional AI v2: Iterative Safety Without Regress. Anthropic Research.',
  },
  {
    id: 'meta-llama4-multimodal',
    date: 'Mar 15',
    org: 'Meta AI',
    title: 'Llama 4 Scout & Maverick: natively multimodal from the ground up',
    summary:
      '17B MoE architecture trained on 40 trillion tokens with native understanding across text, image, and video.',
    category: 'MULTIMODAL',
    longDate: 'March 15, 2026',
    authorsLine: 'Meta GenAI | Llama team',
    overview:
      'Scout and Maverick unify vision, language, and light video understanding in a shared MoE trunk tuned for efficient inference and strong open benchmark coverage.',
    metrics: [
      { value: '17B', label: 'Active MoE params' },
      { value: '40T', label: 'Tokens seen' },
      { value: '119', label: 'Languages' },
    ],
    keyFindings: [
      'Native multimodal pretraining outperforms late fusion on video-caption tasks.',
      'Router stabilizes when experts are specialized early in training.',
      'Open weights enable competitive fine-tunes on domain-specific vision QA.',
      'Latency targets are met via sparse activation on consumer GPUs.',
    ],
    modelsReferenced: [
      { icon: 'FiPackage', name: 'Llama 4 Scout' },
      { icon: 'FiStar', name: 'Llama 4 Maverick' },
      { icon: 'FiActivity', name: 'Gemini 3.1 Pro' },
    ],
    impact: 'High — strengthens the open multimodal ecosystem.',
    citation: 'Meta GenAI (2026). Llama 4 Scout & Maverick Technical Overview. Meta AI Research.',
  },
  {
    id: 'stanford-long-context',
    date: 'Mar 10',
    org: 'Stanford NLP',
    title: 'Long-context recall: how models handle 1M+ token windows',
    summary:
      'Comprehensive evaluation shows sharp recall degradation beyond 200K tokens for most models tested.',
    category: 'EVALUATION',
    longDate: 'March 10, 2026',
    authorsLine: 'Stanford NLP | Liu, H., Zhang, M., et al.',
    overview:
      'Needle-in-haystack variants across legal, code, and chat corpora quantify recall cliffs as context windows grow, with policy recommendations for RAG vs prompt stuffing.',
    metrics: [
      { value: '200K', label: 'Recall cliff (typ.)' },
      { value: '18', label: 'Models tested' },
      { value: '92%', label: 'Best mid-window' },
    ],
    keyFindings: [
      'Synthetic haystacks overestimate recall versus messy real documents.',
      'Chunked attention hints improve tails but not mid-window needle density failures.',
      'Models advertise 1M+ windows yet plateau near 200–400K for reliable QA.',
      'Hybrid retrieval recovers more F1 than raw context beyond 300K tokens.',
    ],
    modelsReferenced: [
      { icon: 'FiCpu', name: 'GPT-5.4' },
      { icon: 'FiAward', name: 'Claude Opus 4.6' },
      { icon: 'FiActivity', name: 'Gemini 3.1 Pro' },
    ],
    impact: 'Medium — guides enterprise architecture for long documents.',
    citation:
      'Liu, H., Zhang, M., et al. (2026). Beyond Advertised Context: Measuring Recall at Million Tokens. Stanford NLP.',
  },
  {
    id: 'deepseek-r1-open',
    date: 'Mar 5',
    org: 'DeepSeek',
    title: 'DeepSeek-R1 open weights: reproducing frontier reasoning at minimal cost',
    summary:
      'Full weight release enables fine-tuning for domain-specific reasoning at a fraction of frontier model costs.',
    category: 'OPEN WEIGHTS',
    longDate: 'March 5, 2026',
    authorsLine: 'DeepSeek-AI',
    overview:
      'Open-weight R1 variants approach closed reasoning models on math benchmarks while keeping training recipes public for replication and specialization.',
    metrics: [
      { value: 'Open', label: 'Weights' },
      { value: '−70%', label: 'Finetune cost*' },
      { value: 'Lean4', label: 'Formal tasks' },
    ],
    keyFindings: [
      'Distillation-friendly checkpoints preserve chain-of-thought quality.',
      'Community fine-tunes close domain gaps within days of release.',
      'Quantized deployments retain most math competence at 4-bit.',
      'Safety tooling integrates similarly to other open reasoning stacks.',
    ],
    modelsReferenced: [
      { icon: 'FiSearch', name: 'DeepSeek-R1' },
      { icon: 'FiMonitor', name: 'DeepSeek-V3' },
    ],
    impact: 'High — democratizes access to strong reasoning baselines.',
    citation: 'DeepSeek-AI (2026). DeepSeek-R1 Open Release Notes. deepseek.com.',
  },
  {
    id: 'openai-gpt54-eval',
    date: 'Feb 28',
    org: 'OpenAI',
    title: 'GPT-5.4 evaluation: real-world performance across enterprise tasks',
    summary:
      'Internal evaluation shows 34% improvement over GPT-4o on enterprise coding and reasoning tasks.',
    category: 'ENTERPRISE',
    longDate: 'February 28, 2026',
    authorsLine: 'OpenAI Systems Card (excerpt)',
    overview:
      'Enterprise-focused harnesses spanning support automation, spreadsheets, code review, and compliance drafting show broad gains with controlled rollout guidance.',
    metrics: [
      { value: '+34%', label: 'vs GPT-4o' },
      { value: '1M+', label: 'Context' },
      { value: '9', label: 'Verticals' },
    ],
    keyFindings: [
      'Largest lifts in multi-file refactors and spreadsheet formula repair.',
      'Latency-aware routing improves tail latency without mean regressions.',
      'Tool-use reliability up on brittle enterprise APIs when schemas are pinned.',
      'Human review checkpoints still recommended for regulated outputs.',
    ],
    modelsReferenced: [{ icon: 'FiCpu', name: 'GPT-5.4' }],
    impact: 'High — shapes enterprise procurement baselines for 2026.',
    citation: 'OpenAI (2026). GPT-5.4 Enterprise Evaluation Summary. OpenAI Systems.',
  },
  {
    id: 'mistral-devstral2',
    date: 'Feb 20',
    org: 'Mistral AI',
    title: 'Devstral 2: pushing boundaries of code intelligence',
    summary: 'New benchmark results show Devstral 2 outperforms all open-source models on SWE-bench verified.',
    category: 'CODE',
    longDate: 'February 20, 2026',
    authorsLine: 'Mistral AI Research',
    overview:
      'Devstral 2 tightens repository-level understanding with better tool integration, improving patch success rates on multi-file tasks.',
    metrics: [
      { value: 'SOTA', label: 'SWE-bench (open)' },
      { value: '256K', label: 'Context' },
      { value: '3×', label: 'Patch throughput' },
    ],
    keyFindings: [
      'Structured diff generation reduces syntax errors in patches.',
      'Cross-file dependency awareness cuts rerolls on medium repos.',
      'Function-calling latency improves with batched tool plans.',
      'Pairing with static analysis boosts merge readiness scores.',
    ],
    modelsReferenced: [
      { icon: 'FiRefreshCw', name: 'Devstral 2' },
      { icon: 'FiSettings', name: 'Mistral Medium 3.1' },
    ],
    impact: 'Medium-high — flagship open option for agentic coding stacks.',
    citation: 'Mistral AI (2026). Devstral 2 Technical Report. mistral.ai.',
  },
];
