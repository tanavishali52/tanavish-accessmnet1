const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  const body = (await res.json()) as BackendResponse<T>;

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return body.data;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  guestMode?: boolean;
}

export function apiSignup(name: string, email: string, password: string) {
  return request<SessionUser>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function apiLogin(email: string, password: string) {
  return request<SessionUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiGuest() {
  return request<SessionUser>('/auth/guest', {
    method: 'POST',
  });
}

export function apiSession() {
  return request<{ authenticated: boolean; user: SessionUser | null }>('/auth/session');
}

export function apiLogout() {
  return request<{ message: string }>('/auth/logout', { method: 'POST' });
}

// ── Catalog ────────────────────────────────────────────────────────────────

export interface Model {
  id: string;
  icon: string;
  bg: string;
  name: string;
  lab: string;
  org: string;
  desc: string;
  tags: string[];
  badge: string;
  badgeClass: string;
  rating: number;
  reviews: number;
  price: string;
  types: string[];
  price_start: number;
}

export interface Lab {
  id: string;
  icon: string;
  name: string;
  count: number;
  color: string;
}

export interface AgentTemplate {
  icon: string;
  title: string;
  desc: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
  tags: string[];
}

export interface ResearchItem {
  date: string;
  org: string;
  title: string;
  summary: string;
}

export function apiModels() {
  return request<Model[]>('/catalog/models');
}

export function apiAgents() {
  return request<AgentTemplate[]>('/catalog/agents');
}

export function apiLabs() {
  return request<Lab[]>('/catalog/labs');
}

export function apiResearch() {
  return request<ResearchItem[]>('/catalog/research');
}

// ── Agents ────────────────────────────────────────────────────────────────

export interface AgentRecord {
  _id: string;
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface AgentRunResult {
  agentId: string;
  agentName: string;
  model: { id: string; name: string; icon: string };
  input: string;
  output: string;
  toolsUsed: string[];
  timestamp: string;
}

export function apiCreateAgent(payload: {
  name: string;
  description?: string;
  modelId: string;
  systemPrompt?: string;
  tools?: string[];
  status?: string;
}) {
  return request<AgentRecord>('/agents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function apiGetAgents() {
  return request<AgentRecord[]>('/agents');
}

export function apiUpdateAgent(id: string, payload: Partial<{
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  tools: string[];
  status: string;
}>) {
  return request<AgentRecord>(`/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function apiDeleteAgent(id: string) {
  return request<{ ok: boolean }>(`/agents/${id}`, { method: 'DELETE' });
}

export function apiRunAgent(id: string, message: string) {
  return request<AgentRunResult>(`/agents/${id}/run`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ── Chat ───────────────────────────────────────────────────────────────────

export interface ChatContext {
  goal?: string;
  audience?: string;
  level?: string;
  budget?: string;
}

export interface ChatReply {
  text: string;
  recs: unknown[];
}

// Chat Session Types
export interface ChatAttachmentType {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface ModelRecommendationType {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  price_start?: number;
}

export interface ChatMessageRecord {
  _id: string;
  conversationId: string;
  role: 'user' | 'ai';
  content: string;
  attachments?: ChatAttachmentType[];
  recs?: ModelRecommendationType[];
  createdAt: string;
}

export interface ChatSessionRecord {
  _id: string;
  sessionId: string;
  isGuest: boolean;
  title: string;
  context?: ChatContext;
  currentModelId?: string;
  messages?: ChatMessageRecord[];
  createdAt: string;
  updatedAt: string;
}

// Existing endpoints
export function apiChatMessage(message: string, context?: ChatContext) {
  return request<ChatReply>('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  });
}

// New Session Management endpoints
export function apiCreateChatSession(payload: {
  sessionId: string;
  isGuest: boolean;
  title?: string;
  context?: ChatContext;
  currentModelId?: string;
}) {
  return request<ChatSessionRecord>('/chat/session/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function apiGetChatSession(sessionId: string) {
  return request<ChatSessionRecord>(`/chat/session/${sessionId}`);
}

export function apiGetUserChats(userId: string) {
  return request<ChatSessionRecord[]>(`/chat/sessions/${userId}`);
}

export function apiUpdateChatSession(sessionId: string, payload: {
  title?: string;
  context?: ChatContext;
  currentModelId?: string;
}) {
  return request<ChatSessionRecord>(`/chat/session/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function apiDeleteChatSession(sessionId: string) {
  return request<{ success: boolean }>(`/chat/session/${sessionId}`, {
    method: 'DELETE',
  });
}

export function apiDeleteAllUserChats(userId: string) {
  return request<{ success: boolean }>(`/chat/sessions/${userId}`, {
    method: 'DELETE',
  });
}

// Message Management endpoints
export function apiSaveChatMessage(
  sessionId: string,
  payload: {
    role: 'user' | 'ai';
    content: string;
    recs?: ModelRecommendationType[];
    attachments?: ChatAttachmentType[];
  },
) {
  return request<ChatMessageRecord>(`/chat/session/${sessionId}/message`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function apiGetChatMessages(sessionId: string) {
  return request<ChatMessageRecord[]>(`/chat/session/${sessionId}/messages`);
}

export function apiDeleteChatMessage(messageId: string, sessionId: string) {
  return request<{ success: boolean }>(`/chat/message/${messageId}/${sessionId}`, {
    method: 'DELETE',
  });
}
