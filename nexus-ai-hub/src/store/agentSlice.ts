import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AgentRecord, AgentRunResult, AgentTemplate } from '@/lib/api';

export type BuilderStep = 'template' | 'configure' | 'test' | 'deploy';

export interface AgentDraft {
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
}

interface AgentState {
  agents: AgentRecord[];
  templates: AgentTemplate[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  builderOpen: boolean;
  builderStep: BuilderStep;
  draft: AgentDraft;
  editingId: string | null;
  runResult: AgentRunResult | null;
  runLoading: boolean;
}

const DEFAULT_DRAFT: AgentDraft = {
  name: '',
  description: '',
  modelId: 'gpt5',
  systemPrompt: '',
  tools: [],
};

const initialState: AgentState = {
  agents: [],
  templates: [],
  status: 'idle',
  builderOpen: false,
  builderStep: 'template',
  draft: DEFAULT_DRAFT,
  editingId: null,
  runResult: null,
  runLoading: false,
};

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    setAgents(state, action: PayloadAction<AgentRecord[]>) {
      state.agents = action.payload;
      state.status = 'loaded';
    },
    setAgentsLoading(state) {
      state.status = 'loading';
    },
    setAgentsError(state) {
      state.status = 'error';
    },
    setTemplates(state, action: PayloadAction<AgentTemplate[]>) {
      state.templates = action.payload;
      state.status = 'loaded';
    },
    addAgent(state, action: PayloadAction<AgentRecord>) {
      state.agents.unshift(action.payload);
    },
    updateAgent(state, action: PayloadAction<AgentRecord>) {
      const idx = state.agents.findIndex((a) => a._id === action.payload._id);
      if (idx !== -1) state.agents[idx] = action.payload;
    },
    removeAgent(state, action: PayloadAction<string>) {
      state.agents = state.agents.filter((a) => a._id !== action.payload);
    },
    openBuilder(state, action: PayloadAction<AgentRecord | undefined>) {
      state.builderOpen = true;
      state.builderStep = action.payload ? 'configure' : 'template';
      state.runResult = null;
      if (action.payload) {
        state.editingId = action.payload._id;
        state.draft = {
          name: action.payload.name,
          description: action.payload.description,
          modelId: action.payload.modelId,
          systemPrompt: action.payload.systemPrompt,
          tools: action.payload.tools,
        };
      } else {
        state.editingId = null;
        state.draft = { ...DEFAULT_DRAFT };
      }
    },
    closeBuilder(state) {
      state.builderOpen = false;
      state.builderStep = 'template';
      state.draft = { ...DEFAULT_DRAFT };
      state.editingId = null;
      state.runResult = null;
    },
    setBuilderStep(state, action: PayloadAction<BuilderStep>) {
      state.builderStep = action.payload;
    },
    setDraft(state, action: PayloadAction<Partial<AgentDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    toggleTool(state, action: PayloadAction<string>) {
      const tool = action.payload;
      if (state.draft.tools.includes(tool)) {
        state.draft.tools = state.draft.tools.filter((t) => t !== tool);
      } else {
        state.draft.tools = [...state.draft.tools, tool];
      }
    },
    setRunResult(state, action: PayloadAction<AgentRunResult | null>) {
      state.runResult = action.payload;
    },
    setRunLoading(state, action: PayloadAction<boolean>) {
      state.runLoading = action.payload;
    },
    applyTemplate(state, action: PayloadAction<{ name: string; description: string; modelId: string; systemPrompt: string; tools: string[] }>) {
      state.draft = { ...state.draft, ...action.payload };
      state.builderStep = 'configure';
    },
  },
});

export const {
  setAgents, setAgentsLoading, setAgentsError,
  setTemplates,
  addAgent, updateAgent, removeAgent,
  openBuilder, closeBuilder, setBuilderStep,
  setDraft, toggleTool,
  setRunResult, setRunLoading,
  applyTemplate,
} = agentSlice.actions;
export default agentSlice.reducer;
