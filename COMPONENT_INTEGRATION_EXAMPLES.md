# Chat Persistence - Component Integration Examples

This file shows how to integrate chat persistence into your existing components: `ChatArea`, `ChatInput`, `ChatView`, and `ChatSidebar`.

---

## 1. ChatArea Component (Messages Display)

**Location**: `src/components/app/chat/ChatArea.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { setMessages } from '@/store/chatSlice';

export default function ChatArea() {
  const dispatch = useDispatch();
  const { currentSessionId, messages, isSaving } = useSelector((s: RootState) => s.chat);
  const { loadSession } = useChatPersistence();

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadSession(currentSessionId).catch(console.error);
    }
  }, [currentSessionId, loadSession]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Start a conversation</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-md p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p>{msg.content}</p>
            {msg.recs && msg.recs.length > 0 && msg.role === 'ai' && (
              <div className="mt-2 space-y-1">
                {msg.recs.slice(0, 3).map((rec: any) => (
                  <div key={rec.id} className="text-sm opacity-75">
                    📌 {rec.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isSaving && (
        <div className="text-xs text-gray-400 text-center">
          💾 Saving...
        </div>
      )}
    </div>
  );
}
```

---

## 2. ChatInput Component (Input & Send)

**Location**: `src/components/app/chat/ChatInput.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addMessage, setHasUnsavedChanges } from '@/store/chatSlice';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { apiChatMessage } from '@/lib/api';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { currentSessionId, isSaving, userGoal, userAudience, userLevel, userBudget } = useSelector(
    (s: RootState) => s.chat,
  );
  const { createNewSession } = useChatPersistence();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isSaving) return;

    try {
      setIsLoading(true);

      // Create session if needed
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession('New Chat');
      }

      // Add user message
      const messageId = `msg_${Date.now()}`;
      dispatch(addMessage({
        id: messageId,
        role: 'user',
        content: input.trim(),
        timestamp: Date.now(),
      }));

      // Mark as unsaved - will be auto-saved after 2 seconds
      dispatch(setHasUnsavedChanges(true));

      // Get AI response
      try {
        const reply = await apiChatMessage(input.trim(), {
          goal: userGoal,
          audience: userAudience,
          level: userLevel,
          budget: userBudget,
        });

        // Add AI response
        dispatch(addMessage({
          id: `msg_${Date.now() + 1}`,
          role: 'ai',
          content: reply.text,
          recs: reply.recs as any,
          timestamp: Date.now(),
        }));

        // Mark as unsaved
        dispatch(setHasUnsavedChanges(true));
      } catch (error) {
        console.error('Error getting AI response:', error);
        // Show error message to user
        dispatch(addMessage({
          id: `msg_${Date.now() + 1}`,
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        }));
      }

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || isSaving}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || isSaving || !input.trim()}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Send'}
        </button>
      </div>
      {isLoading && (
        <p className="text-xs text-gray-500 mt-2">Getting response...</p>
      )}
    </form>
  );
}
```

---

## 3. ChatView Component (Main Chat Container)

**Location**: `src/components/app/chat/ChatView.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { setCurrentSessionId } from '@/store/chatSlice';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';

export default function ChatView() {
  const dispatch = useDispatch();
  const { currentSessionId } = useSelector((s: RootState) => s.chat);
  const { loadUserSessions, createNewSession } = useChatPersistence();

  // Load sessions on mount
  useEffect(() => {
    loadUserSessions();
  }, [loadUserSessions]);

  // Create initial session if none exist
  useEffect(() => {
    if (!currentSessionId) {
      createNewSession('New Chat').catch(console.error);
    }
  }, [currentSessionId, createNewSession]);

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar with session list */}
      <ChatSidebar />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages display */}
        <ChatArea />

        {/* Input area */}
        <ChatInput />
      </div>
    </div>
  );
}
```

---

## 4. ChatSidebar Component (Session List)

**Location**: `src/components/app/chat/ChatSidebar.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { setCurrentSessionId, removeSession } from '@/store/chatSlice';

export default function ChatSidebar() {
  const dispatch = useDispatch();
  const { sessions, currentSessionId } = useSelector((s: RootState) => s.chat);
  const { createNewSession, loadSession } = useChatPersistence();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = async () => {
    setIsLoading(true);
    try {
      await createNewSession('New Chat');
    } catch (error) {
      console.error('Failed to create new chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      await loadSession(sessionId);
      dispatch(setCurrentSessionId(sessionId));
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    // Call API to delete from backend
    // Then remove from Redux state
    dispatch(removeSession(sessionId));
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent2 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating...' : '+ New Chat'}
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No chats yet</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer group transition-colors ${
                currentSessionId === session.id
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div
                onClick={() => handleSelectSession(session.id)}
                className="flex-1 min-w-0"
              >
                <h3 className="text-sm font-medium truncate">{session.title}</h3>
                <p className="text-xs opacity-75 truncate">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Delete button on hover */}
              <button
                onClick={() => handleDeleteSession(session.id)}
                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-600 transition-opacity"
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## 5. ChatRightPanel Component (With Persistence)

**Location**: `src/components/app/chat/ChatRightPanel.tsx`

```tsx
'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { setUserGoal, setUserBudget, setUserAudience, setUserLevel } from '@/store/chatSlice';

export default function ChatRightPanel() {
  const dispatch = useDispatch();
  const { userGoal, userBudget, userAudience, userLevel, currentSessionId } = useSelector(
    (s: RootState) => s.chat,
  );
  const { updateSessionMetadata } = useChatPersistence();

  const handleContextChange = async (
    field: 'goal' | 'budget' | 'audience' | 'level',
    value: string,
  ) => {
    // Update Redux state
    if (field === 'goal') dispatch(setUserGoal(value));
    else if (field === 'budget') dispatch(setUserBudget(value));
    else if (field === 'audience') dispatch(setUserAudience(value));
    else if (field === 'level') dispatch(setUserLevel(value));

    // Update in database
    if (currentSessionId) {
      await updateSessionMetadata(currentSessionId);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Context</h3>

      <div className="space-y-4">
        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <select
            value={userGoal}
            onChange={(e) => handleContextChange('goal', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select goal...</option>
            <option value="Code & Dev">Code & Dev</option>
            <option value="Image Generation">Image Generation</option>
            <option value="Content Writing">Content Writing</option>
            <option value="Data Analysis">Data Analysis</option>
            <option value="Research">Research</option>
          </select>
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Audience</label>
          <select
            value={userAudience}
            onChange={(e) => handleContextChange('audience', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select audience...</option>
            <option value="Small business">Small business</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Individual">Individual</option>
            <option value="Startup">Startup</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium mb-2">Experience Level</label>
          <select
            value={userLevel}
            onChange={(e) => handleContextChange('level', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select level...</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">Budget</label>
          <select
            value={userBudget}
            onChange={(e) => handleContextChange('budget', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select budget...</option>
            <option value="Free">Free</option>
            <option value="Under $50">Under $50/mo</option>
            <option value="$50-100">$50-100/mo</option>
            <option value="$100+">$100+/mo</option>
          </select>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium mb-2">Session Info</h4>
        {currentSessionId && (
          <p className="text-xs text-gray-600 break-all">{currentSessionId}</p>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Error Handling Example

**Location**: `src/components/app/chat/ChatErrorBoundary.tsx`

```tsx
'use client';

import React, { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChatErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-accent text-white rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. Complete Layout Integration

**Location**: `src/app/chat/page.tsx`

```tsx
'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ChatView from '@/components/app/chat/ChatView';
import { ChatErrorBoundary } from '@/components/app/chat/ChatErrorBoundary';

export default function ChatPage() {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please sign in to continue</p>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <ChatView />
    </ChatErrorBoundary>
  );
}
```

---

## Key Integration Points

1. **ChatArea** - Loads messages when session changes
2. **ChatInput** - Creates session and saves messages
3. **ChatView** - Initializes persistence and loads user sessions
4. **ChatSidebar** - Shows session list and allows switching
5. **ChatRightPanel** - Updates context and persists to DB

---

## Use These Components!

Replace your existing component imports with these examples to enable full chat persistence. Each component is ready to use and follows the codebase conventions.
