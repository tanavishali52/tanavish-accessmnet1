# Chat Persistence Quick Reference

## Basic Setup (5 minutes)

### In Your Chat Component:

```tsx
'use client';

import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setHasUnsavedChanges } from '@/store/chatSlice';

export function ChatView() {
  const dispatch = useDispatch();
  const { currentSessionId, messages, isSaving } = useSelector((s) => s.chat);
  
  // Initialize persistence hook
  const { createNewSession } = useChatPersistence();

  const handleSendMessage = async (text: string) => {
    // Create session if needed
    if (!currentSessionId) {
      await createNewSession('New Chat');
    }

    // Add message and mark for saving
    dispatch(addMessage({
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }));
    
    // This triggers auto-save after 2 seconds
    dispatch(setHasUnsavedChanges(true));
  };

  return (
    <>
      {isSaving && <div>Saving...</div>}
      {/* Your chat UI */}
    </>
  );
}
```

---

## Common Tasks

### Create a New Chat Session
```tsx
const { createNewSession } = useChatPersistence();
const sessionId = await createNewSession('My Chat Title');
```

### Load Previous Chats
```tsx
const { loadUserSessions } = useChatPersistence();
// Called automatically on mount with autoLoadSessions: true
```

### Load a Specific Session
```tsx
const { loadSession } = useChatPersistence();
await loadSession('session_id_here');
```

### Save a Message
```tsx
dispatch(addMessage({
  id: `msg_${Date.now()}`,
  role: 'user',
  content: 'Hello!',
  timestamp: Date.now(),
}));
dispatch(setHasUnsavedChanges(true));
// Auto-saved after 2 seconds
```

### Handle Saving State
```tsx
const { isSaving, hasUnsavedChanges } = useSelector((s) => s.chat);

<button disabled={isSaving}>
  {isSaving ? 'Saving...' : 'Send'}
</button>
```

---

## Redux Actions Cheat Sheet

```tsx
// Session Management
setCurrentSessionId(sessionId)      // Switch to a session
setSessions(sessionsList)           // Load all sessions
addSession(session)                 // Add new session

// Message Management
addMessage(message)                 // Add message to current session
setMessages(messagesList)           // Load messages for session
clearMessages()                     // Clear all messages

// Saving State
setIsSaving(true/false)            // Indicate saving in progress
setHasUnsavedChanges(true/false)   // Mark unsaved changes

// User Context
setUserGoal(goal)
setUserBudget(budget)
setUserAudience(audience)
setUserLevel(level)
```

---

## Database Structure

### ChatSession Collection
```
{
  _id: ObjectId
  sessionId: "user_id_or_guest_id"
  isGuest: boolean
  title: "Chat Title"
  context: {
    goal: string
    budget: string
    audience: string
    level: string
  }
  currentModelId: "gpt-4"
  messages: [Message IDs]
  createdAt: Date
  updatedAt: Date
}
```

### ChatMessage Collection
```
{
  _id: ObjectId
  conversationId: ChatSession ID
  role: "user" | "ai"
  content: "Message text"
  recs: [Models]
  attachments: [Files]
  createdAt: Date
}
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chat/session/create` | Create new session |
| GET | `/chat/session/:id` | Get session + messages |
| GET | `/chat/sessions/:userId` | Get all user sessions |
| PUT | `/chat/session/:id` | Update session |
| DELETE | `/chat/session/:id` | Delete session |
| POST | `/chat/session/:id/message` | Save message |
| GET | `/chat/session/:id/messages` | Get messages |

---

## Guest User Flow

```
User visits site
  ↓
apiGuest() called → guest_<uuid> created
  ↓
useChatPersistence() → creates chat with isGuest: true
  ↓
Messages saved with sessionId: "guest_<uuid>"
  
--- User Signs Up ---
  ↓
Auth state updates
  ↓
New chats created with user's actual ID
  ↓
(Optional) Migrate guest chats to user's account
```

---

## TypeScript Types

```tsx
// Session
interface ChatSession {
  id: string;
  title: string;
  isGuest: boolean;
  createdAt: number;
  updatedAt: number;
}

// Message
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  recs?: Model[];
  attachments?: ChatAttachment[];
  timestamp: number;
}

// Persistence Hook Options
interface UseChatPersistenceOptions {
  autoSave?: boolean;        // Auto-save after 2s (default: true)
  autoLoadSessions?: boolean; // Auto-load on mount (default: true)
}
```

---

## Debugging Tips

### Check Session ID
```tsx
const { currentSessionId } = useSelector((s) => s.chat);
console.log('Current session:', currentSessionId);
```

### Monitor Saving
```tsx
const { isSaving, hasUnsavedChanges } = useSelector((s) => s.chat);
console.log('Saving:', isSaving, 'Unsaved:', hasUnsavedChanges);
```

### Check Messages
```tsx
const { messages } = useSelector((s) => s.chat);
console.log('Messages:', messages);
```

### Verify User ID
```tsx
const { user } = useSelector((s) => s.auth);
const userId = user?.guestMode ? `guest_${user.id}` : user?.id;
console.log('User ID:', userId);
```

---

## Error Handling

```tsx
try {
  await createNewSession('New Chat');
} catch (error) {
  console.error('Failed to create session:', error);
  // Show error toast to user
  dispatch(setError(error.message));
}
```

---

## Performance Tips

1. **Auto-save is debounced** - No need to manually debounce save calls
2. **Use setHasUnsavedChanges** - Only save when actually needed
3. **Load sessions once** - `autoLoadSessions: true` loads on mount
4. **Batch message additions** - Add multiple messages before setting unsaved state
5. **Check isSaving state** - Disable UI while saving to prevent conflicts

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Testing Checklist

- [ ] Create new chat session
- [ ] Send message and verify save
- [ ] Load previous chat
- [ ] Load multiple sessions
- [ ] Switch between sessions
- [ ] Verify guest user handling
- [ ] Check database for stored data
- [ ] Test offline behavior
- [ ] Verify unsaved changes indicator
- [ ] Test error scenarios

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Messages not saving | Check `currentSessionId` is set, `hasUnsavedChanges` is true |
| Sessions not loading | Verify user ID is correct, check API response |
| Duplicate messages | Don't manually call saveMessages if `autoSave: true` |
| Guest sessions lost | Need to implement session migration on sign-up |
| Race conditions | Let auto-save handle it, don't manually save |

---

## Next Features to Consider

- [ ] Real-time message sync with WebSockets
- [ ] Message editing/deletion UI
- [ ] Chat search functionality
- [ ] Export/download chats
- [ ] Session sharing
- [ ] Message pinning
- [ ] Conversation bookmarking
