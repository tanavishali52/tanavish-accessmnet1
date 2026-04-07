import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Model } from '@/lib/api';

export type OnboardPhase = 'start' | 'goal' | 'audience' | 'level' | 'budget' | 'done' | 'chat';

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  recs?: Model[];
  attachments?: ChatAttachment[];
  timestamp: number;
  savedId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  isGuest: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  currentSessionId: string | null; // Current active session
  sessions: ChatSession[]; // List of user's sessions
  messages: ChatMessage[];
  /** Set by landing hero guided flow; ChatInput consumes once to send + fetch AI reply. */
  pendingAutoMessage: string | null;
  onboardPhase: OnboardPhase;
  obDone: boolean;
  userGoal: string;
  userAudience: string;
  userLevel: string;
  userBudget: string;
  currentModelId: string;
  pendingRecs: Model[];
  isTyping: boolean;
  isSaving: boolean; // Track if messages are being saved
  hasUnsavedChanges: boolean; // Track if there are unsaved messages
}

export interface PersistedChatState {
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  onboardPhase: OnboardPhase;
  obDone: boolean;
  userGoal: string;
  userAudience: string;
  userLevel: string;
  userBudget: string;
  currentModelId: string;
  pendingRecs: Model[];
}

const initialState: ChatState = {
  currentSessionId: null,
  sessions: [],
  messages: [],
  pendingAutoMessage: null,
  onboardPhase: 'start',
  obDone: false,
  userGoal: '',
  userAudience: '',
  userLevel: '',
  userBudget: '',
  currentModelId: 'gpt5',
  pendingRecs: [],
  isTyping: false,
  isSaving: false,
  hasUnsavedChanges: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    hydrateChatState(state, action: PayloadAction<PersistedChatState>) {
      const payload = action.payload;
      state.currentSessionId = payload.currentSessionId;
      state.sessions = payload.sessions;
      state.messages = payload.messages;
      state.onboardPhase = payload.onboardPhase;
      state.obDone = payload.obDone;
      state.userGoal = payload.userGoal;
      state.userAudience = payload.userAudience;
      state.userLevel = payload.userLevel;
      state.userBudget = payload.userBudget;
      state.currentModelId = payload.currentModelId;
      state.pendingRecs = payload.pendingRecs;
      state.isTyping = false;
      state.isSaving = false;
      state.hasUnsavedChanges = false;
      state.pendingAutoMessage = null;
    },
    // Session Management
    setCurrentSessionId(state, action: PayloadAction<string | null>) {
      state.currentSessionId = action.payload;
    },
    setSessions(state, action: PayloadAction<ChatSession[]>) {
      state.sessions = action.payload;
    },
    addSession(state, action: PayloadAction<ChatSession>) {
      state.sessions.push(action.payload);
      state.currentSessionId = action.payload.id;
    },
    updateSession(state, action: PayloadAction<ChatSession>) {
      const index = state.sessions.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.sessions[index] = action.payload;
      }
    },
    removeSession(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
      if (state.currentSessionId === action.payload) {
        state.currentSessionId = state.sessions.length > 0 ? state.sessions[0].id : null;
      }
    },
    
    // Message Management
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
      state.hasUnsavedChanges = false;
    },
    setPendingAutoMessage(state, action: PayloadAction<string | null>) {
      state.pendingAutoMessage = action.payload;
    },
    markMessageSaved(state, action: PayloadAction<{ id: string; savedId: string }>) {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index >= 0) {
        state.messages[index].savedId = action.payload.savedId;
      }
    },
    
    // Onboarding & Context
    setOnboardPhase(state, action: PayloadAction<OnboardPhase>) {
      state.onboardPhase = action.payload;
    },
    setObDone(state, action: PayloadAction<boolean>) {
      state.obDone = action.payload;
    },
    setUserGoal(state, action: PayloadAction<string>) {
      state.userGoal = action.payload;
    },
    setUserAudience(state, action: PayloadAction<string>) {
      state.userAudience = action.payload;
    },
    setUserLevel(state, action: PayloadAction<string>) {
      state.userLevel = action.payload;
    },
    setUserBudget(state, action: PayloadAction<string>) {
      state.userBudget = action.payload;
    },
    
    // Model & Loading States
    setCurrentModelId(state, action: PayloadAction<string>) {
      state.currentModelId = action.payload;
    },
    setPendingRecs(state, action: PayloadAction<Model[]>) {
      state.pendingRecs = action.payload;
    },
    setIsTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload;
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    setHasUnsavedChanges(state, action: PayloadAction<boolean>) {
      state.hasUnsavedChanges = action.payload;
    },
    
    // Utility Actions
    clearMessages(state) {
      state.messages = [];
      state.hasUnsavedChanges = false;
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  hydrateChatState,
  setCurrentSessionId,
  setSessions,
  addSession,
  updateSession,
  removeSession,
  addMessage,
  setMessages,
  setPendingAutoMessage,
  markMessageSaved,
  setOnboardPhase,
  setObDone,
  setUserGoal,
  setUserAudience,
  setUserLevel,
  setUserBudget,
  setCurrentModelId,
  setPendingRecs,
  setIsTyping,
  setIsSaving,
  setHasUnsavedChanges,
  clearMessages,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
