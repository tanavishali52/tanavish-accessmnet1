import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Model } from '@/lib/api';

export type OnboardPhase = 'start' | 'goal' | 'audience' | 'level' | 'budget' | 'done' | 'chat';

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  recs?: Model[];
  attachments?: ChatAttachment[];
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  onboardPhase: OnboardPhase;
  obDone: boolean;
  userGoal: string;
  userAudience: string;
  userLevel: string;
  userBudget: string;
  currentModelId: string;
  pendingRecs: Model[];
  isTyping: boolean;
}

const initialState: ChatState = {
  messages: [],
  onboardPhase: 'start',
  obDone: false,
  userGoal: '',
  userAudience: '',
  userLevel: '',
  userBudget: '',
  currentModelId: 'gpt5',
  pendingRecs: [],
  isTyping: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
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
    setCurrentModelId(state, action: PayloadAction<string>) {
      state.currentModelId = action.payload;
    },
    setPendingRecs(state, action: PayloadAction<Model[]>) {
      state.pendingRecs = action.payload;
    },
    setIsTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  addMessage, setOnboardPhase, setObDone, setUserGoal, setUserAudience,
  setUserLevel, setUserBudget, setCurrentModelId, setPendingRecs,
  setIsTyping, clearMessages, resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
