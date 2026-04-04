# Chat Session & Message Persistence Implementation Guide

This guide explains how to integrate the chat persistence system into your React components.

## Overview

The chat persistence system allows you to:
- Store chat sessions in MongoDB for both guest and logged-in users
- Automatically save chat messages as users type
- Load previous chat sessions
- Manage multiple chat sessions per user
- Auto-save with debouncing to optimize database calls

## Architecture

### Backend (NestJS)
- **Schemas**: `ChatSession` and `ChatMessage` MongoDB schemas
- **Controller**: `/chat/*` endpoints for CRUD operations
- **Service**: `ChatService` with database operations

### Frontend (Next.js/React)
- **API Functions**: New functions in `lib/api.ts` for session management
- **Redux Slice**: Updated `chatSlice.ts` with session and saving state
- **Custom Hook**: `useChatPersistence` hook for managing persistence logic

---

## How to Use

### 1. Initialize Chat Persistence in Your Component

```tsx
'use client';

import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';

export function ChatView() {
  const dispatch = useDispatch();
  const { currentSessionId, messages } = useSelector((s: RootState) => s.chat);
  
  const { createNewSession, loadSession, loadUserSessions } = useChatPersistence({
    autoSave: true,        // Auto-save messages after 2 seconds of inactivity
    autoLoadSessions: true // Auto-load user's previous sessions on mount
  });

  // Rest of your component...
}
```

### 2. Create a New Chat Session

```tsx
const handleNewChat = async () => {
  try {
    const sessionId = await createNewSession('My First Chat');
    console.log('Created session:', sessionId);
    // The hook automatically updates Redux state
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};
```

### 3. Load a Previous Session

```tsx
const handleLoadSession = async (sessionId: string) => {
  try {
    await loadSession(sessionId);
    // Messages are now loaded into Redux state
  } catch (error) {
    console.error('Failed to load session:', error);
  }
};
```

### 4. Send and Save a Message

```tsx
import { addMessage, setHasUnsavedChanges } from '@/store/chatSlice';

const handleSendMessage = async (content: string) => {
  // Add message to Redux state
  dispatch(addMessage({
    id: `msg_${Date.now()}`, // Temporary ID
    role: 'user',
    content,
    timestamp: Date.now(),
  }));
  
  // Mark as unsaved - the hook will auto-save after 2 seconds
  dispatch(setHasUnsavedChanges(true));

  // Get AI response
  const reply = await apiChatMessage(content, {
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
    recs: reply.recs,
    timestamp: Date.now(),
  }));

  // Mark as unsaved
  dispatch(setHasUnsavedChanges(true));
};
```

### 5. Track Saving State

```tsx
import { useSelector } from 'react-redux';

export function ChatArea() {
  const { isSaving, hasUnsavedChanges } = useSelector((s: RootState) => s.chat);

  return (
    <div>
      {isSaving && <p>Saving...</p>}
      {hasUnsavedChanges && <p className="text-yellow-500">Unsaved changes</p>}
      {/* Your chat UI */}
    </div>
  );
}
```

---

## API Endpoints

### Session Management
- `POST /chat/session/create` - Create new session
- `GET /chat/session/:sessionId` - Get session with messages
- `GET /chat/sessions/:userId` - Get all user sessions
- `PUT /chat/session/:sessionId` - Update session
- `DELETE /chat/session/:sessionId` - Delete session
- `DELETE /chat/sessions/:userId` - Delete all user sessions

### Message Management
- `POST /chat/session/:sessionId/message` - Save a message
- `GET /chat/session/:sessionId/messages` - Get all messages in session
- `DELETE /chat/message/:messageId/:sessionId` - Delete a message

---

## Data Models

### ChatSession
```typescript
{
  _id: ObjectId;
  sessionId: string;           // User ID or guest session ID
  isGuest: boolean;
  title: string;
  context: {
    goal?: string;
    audience?: string;
    level?: string;
    budget?: string;
  };
  currentModelId: string;
  messages: ObjectId[];        // References to ChatMessage documents
  createdAt: Date;
  updatedAt: Date;
}
```

### ChatMessage
```typescript
{
  _id: ObjectId;
  conversationId: ObjectId;    // Reference to ChatSession
  role: 'user' | 'ai';
  content: string;
  recs?: Array<{
    id: string;
    name: string;
    rating?: number;
    price_start?: number;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  createdAt: Date;
}
```

---

## Guest User Handling

Guest users are handled seamlessly:

1. When a guest creates an account, their `sessionId` is `guest_<uuid>`
2. We store this in the database with `isGuest: true`
3. When they log in, you can optionally migrate their guest sessions:
   ```tsx
   // After successful login
   const guestSessions = await apiGetUserChats(`guest_${guestId}`);
   // Migrate or keep them as-is
   ```

---

## Best Practices

1. **Always use the hook** - Don't manually call API functions from components
2. **Let auto-save handle persistence** - Don't manually call `saveMessages()` unless necessary
3. **Check `isSaving` state** - Disable inputs while saving to prevent conflicts
4. **Handle errors gracefully** - Show user feedback when operations fail
5. **Load sessions on app start** - The hook does this automatically with `autoLoadSessions: true`
6. **Update session metadata** - Call `updateSessionMetadata()` when user context changes

---

## Environment Setup

Ensure your `.env.local` has the correct API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Example: Complete Chat Component Integration

```tsx
'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { addMessage, setHasUnsavedChanges } from '@/store/chatSlice';
import { RootState } from '@/store';
import { apiChatMessage } from '@/lib/api';

export default function ChatView() {
  const dispatch = useDispatch();
  const { currentSessionId, messages, isSaving, hasUnsavedChanges, userGoal } = useSelector((s: RootState) => s.chat);
  const [input, setInput] = useState('');

  const { createNewSession, loadSession } = useChatPersistence({ autoSave: true });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId) return;

    // Create session if needed
    if (!currentSessionId) {
      const sessionId = await createNewSession();
      // Session ID is now set by the hook
    }

    // Add user message
    dispatch(addMessage({
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }));

    dispatch(setHasUnsavedChanges(true));

    try {
      // Get AI response
      const reply = await apiChatMessage(input, { goal: userGoal });
      
      // Add AI response
      dispatch(addMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'ai',
        content: reply.text,
        recs: reply.recs,
        timestamp: Date.now(),
      }));

      dispatch(setHasUnsavedChanges(true));
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSaving}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSaving || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Send'}
          </button>
        </div>
        {hasUnsavedChanges && <p className="text-xs text-yellow-600 mt-1">Unsaved changes</p>}
      </form>
    </div>
  );
}
```

---

## Troubleshooting

### Messages not saving
- Check if `currentSessionId` is set (create a session first)
- Verify `hasUnsavedChanges` is `true`
- Check browser console for API errors
- Ensure MongoDB connection is working

### Duplicate messages
- Don't manually save messages if `autoSave` is enabled
- Clear message IDs after successful save

### Sessions not loading
- Verify user ID is correct
- Check if `autoLoadSessions: true` in hook options
- Ensure API returns correct data structure

---

## Future Enhancements

- [ ] Real-time sync with WebSockets
- [ ] Message editing and deletion from UI
- [ ] Session sharing between users
- [ ] Export chat as PDF
- [ ] Pinned/starred messages
- [ ] Message search
