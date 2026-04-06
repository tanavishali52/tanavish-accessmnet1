'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  setIsSaving,
  setHasUnsavedChanges,
  setCurrentSessionId,
  setSessions,
  setMessages,
  addSession,
  markMessageSaved,
  setObDone,
  setOnboardPhase,
} from '@/store/chatSlice';
import {
  apiCreateChatSession,
  apiSaveChatMessage,
  apiGetUserChats,
  apiGetChatSession,
  apiUpdateChatSession,
  ChatMessageRecord,
  ChatContext,
  ChatAttachmentType,
  ModelRecommendationType,
  Model,
} from '@/lib/api';
import { CHAT_SESSION_STORAGE_KEY } from '@/lib/chatStorageKeys';

interface UseChatPersistenceOptions {
  autoSave?: boolean;
  autoLoadSessions?: boolean;
}

/**
 * Custom hook for managing chat session and message persistence to database.
 * Handles creation, loading, and saving of chat data for both guest and logged-in users.
 */
export function useChatPersistence({ autoSave = true, autoLoadSessions = true }: UseChatPersistenceOptions = {}) {
  const dispatch = useDispatch();
  const { currentSessionId, messages, hasUnsavedChanges, userGoal, userAudience, userLevel, userBudget, currentModelId } = useSelector((s: RootState) => s.chat);
  const { user } = useSelector((s: RootState) => s.auth);

  /** Same id as auth (guest: `guest_<uuid>`, logged-in: Mongo user id). Used as chat `sessionId` in DB. */
  const userId = user?.id ?? null;
  const isGuest = user?.guestMode ?? false;

  // ────────────────────────────────────────────────────────────────────
  // Session Management
  // ────────────────────────────────────────────────────────────────────

  const createNewSession = useCallback(
    async (title?: string) => {
      if (!userId) return null;

      try {
        dispatch(setIsSaving(true));
        const context: ChatContext = {
          goal: userGoal,
          audience: userAudience,
          level: userLevel,
          budget: userBudget,
        };

        const session = await apiCreateChatSession({
          sessionId: userId,
          isGuest,
          title: title ?? 'Untitled Chat',
          context,
          currentModelId,
        });

        dispatch(
          addSession({
            id: session._id,
            title: session.title,
            isGuest: session.isGuest,
            createdAt: new Date(session.createdAt).getTime(),
            updatedAt: new Date(session.updatedAt).getTime(),
          }),
        );

        dispatch(setCurrentSessionId(session._id));
        dispatch(setHasUnsavedChanges(false));

        return session._id;
      } catch (error) {
        console.error('Failed to create chat session:', error);
        return null;
      } finally {
        dispatch(setIsSaving(false));
      }
    },
    [userId, isGuest, userGoal, userAudience, userLevel, userBudget, currentModelId, dispatch],
  );

  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        dispatch(setIsSaving(true));
        const session = await apiGetChatSession(sessionId);

        // Update session info
        dispatch(setCurrentSessionId(sessionId));

        // Load messages
        const messagesData = session.messages ?? [];
        const formattedMessages = messagesData.map((msg: ChatMessageRecord) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          recs: msg.recs as unknown as Model[],
          attachments: msg.attachments as ChatAttachmentType[] | undefined,
          timestamp: new Date(msg.createdAt).getTime(),
          savedId: msg._id,
        }));

        dispatch(setMessages(formattedMessages));
        dispatch(setHasUnsavedChanges(false));
        if (formattedMessages.length > 0) {
          dispatch(setOnboardPhase('chat'));
          dispatch(setObDone(true));
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        throw error;
      } finally {
        dispatch(setIsSaving(false));
      }
    },
    [dispatch],
  );

  const loadUserSessions = useCallback(async () => {
    if (!userId) return;

    try {
      const sessions = await apiGetUserChats(userId);
      dispatch(
        setSessions(
          sessions.map((s) => ({
            id: s._id,
            title: s.title,
            isGuest: s.isGuest,
            createdAt: new Date(s.createdAt).getTime(),
            updatedAt: new Date(s.updatedAt).getTime(),
          })),
        ),
      );

      if (sessions.length === 0) return;

      const preferred =
        typeof window !== 'undefined' ? window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY) : null;
      const preferredOk = preferred && sessions.some((s) => s._id === preferred);

      if (preferredOk && preferred) {
        await loadSession(preferred);
        return;
      }

      if (preferred && !preferredOk) {
        window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
      }

      const mostRecentSession = [...sessions].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0];
      await loadSession(mostRecentSession._id);
    } catch (error) {
      console.error('Failed to load user sessions:', error);
    }
  }, [userId, dispatch, loadSession]);

  const updateSessionMetadata = useCallback(
    async (sessionId: string, title?: string) => {
      try {
        const context: ChatContext = {
          goal: userGoal,
          audience: userAudience,
          level: userLevel,
          budget: userBudget,
        };

        await apiUpdateChatSession(sessionId, {
          title: title,
          context,
          currentModelId,
        });
      } catch (error) {
        console.error('Failed to update session metadata:', error);
      }
    },
    [userGoal, userAudience, userLevel, userBudget, currentModelId],
  );

  // ────────────────────────────────────────────────────────────────────
  // Message Persistence
  // ────────────────────────────────────────────────────────────────────

  const saveMessageToDb = useCallback(
    async (message: { id: string; role: 'user' | 'ai'; content: string; recs?: ModelRecommendationType[]; attachments?: ChatAttachmentType[] }) => {
      if (!message.id || !message.content) return null;
      const existing = messages.find((m) => m.id === message.id);
      if (existing?.savedId) return null;

      const sessionId = currentSessionId ?? (await createNewSession());
      if (!sessionId) return null;

      try {
        const saved = await apiSaveChatMessage(sessionId, {
          role: message.role,
          content: message.content,
          recs: message.recs,
          attachments: message.attachments,
        });

        dispatch(markMessageSaved({ id: message.id, savedId: saved._id }));
        return saved;
      } catch (error) {
        console.error('Failed to save message:', error);
        return null;
      }
    },
    [currentSessionId, createNewSession, dispatch, messages],
  );

  const saveMessages = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    try {
      dispatch(setIsSaving(true));
      const unsavedMessages = messages.filter((message) => !message.savedId);

      for (const message of unsavedMessages) {
        await saveMessageToDb(message);
      }

      dispatch(setHasUnsavedChanges(false));
    } catch (error) {
      console.error('Failed to save messages:', error);
      throw error;
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [hasUnsavedChanges, messages, dispatch, saveMessageToDb]);

  // ────────────────────────────────────────────────────────────────────
  // Auto-save Logic
  // ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !currentSessionId) return;

    // Debounce auto-save to avoid too frequent requests
    const timeout = setTimeout(() => {
      saveMessages();
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [autoSave, hasUnsavedChanges, currentSessionId, saveMessages]);

  // ────────────────────────────────────────────────────────────────────
  // Auto-load Sessions on Mount
  // ────────────────────────────────────────────────────────────────────

  const lastLoadedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!autoLoadSessions) return;
    if (!userId) {
      lastLoadedUserId.current = null;
      return;
    }
    if (lastLoadedUserId.current === userId) return;
    lastLoadedUserId.current = userId;
    void loadUserSessions();
  }, [autoLoadSessions, userId, loadUserSessions]);

  return {
    createNewSession,
    loadUserSessions,
    loadSession,
    updateSessionMetadata,
    saveMessageToDb,
    saveMessages,
    userId,
    isGuest,
  };
}
