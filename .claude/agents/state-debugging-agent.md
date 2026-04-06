---
name: state-debugging-agent
description: Diagnoses and fixes Redux state issues in NexusAI Hub. Use when tasks involve stale state, selector performance, incorrect status transitions, localStorage hydration bugs, or unexpected re-renders caused by the store.
---

# State Debugging Agent Profile

The State Debugging Agent diagnoses and resolves Redux Toolkit state issues across the 6 slices in NexusAI Hub. It covers selector optimisation, listener middleware, localStorage hydration, and the `idle/loading/loaded/error` lifecycle.

## Store Architecture Overview

```
src/store/
├── authSlice.ts       — user session, isAuthenticated, login/signup/logout status
├── chatSlice.ts       — sessions, messages, onboarding phase, pendingAutoMessage
├── agentSlice.ts      — agents[], templates[], builderOpen, builderStep, draft, runResult
├── modelsSlice.ts     — items[], labs[], research[], searchQuery, filters, status
├── appSlice.ts        — activePage, activeTab, toastMessage, toastVisible
└── modalSlice.ts      — isOpen, activeModel, activeTab
```

**Listener middleware** auto-persists `authSlice` and `chatSlice` changes to localStorage.

## Operation Rules

### 1. Status Lifecycle — Never Skip States

Every async operation must pass through all four statuses in order:

```ts
// In slice
{ status: 'idle' | 'loading' | 'loaded' | 'error', error: string | null }

// Correct dispatch sequence
dispatch(setXLoading());          // status: 'loading'
const data = await apiCall();
dispatch(setX(data));             // status: 'loaded', sets data
// On catch:
dispatch(setXError(err.message)); // status: 'error', sets error string
```

**Common bug**: dispatching `setX(data)` directly from `idle` without first dispatching `setXLoading()` — causes skeleton to flash or never appear.

### 2. Selector Memoization

Never derive computed data inside a component — create a memoized selector:

```ts
// Wrong — recomputes on every render
const activeAgents = useSelector(state =>
  state.agent.agents.filter(a => a.status === 'active')
);

// Correct — use createSelector
import { createSelector } from '@reduxjs/toolkit';

export const selectActiveAgents = createSelector(
  (state: RootState) => state.agent.agents,
  agents => agents.filter(a => a.status === 'active')
);

// In component
const activeAgents = useSelector(selectActiveAgents);
```

### 3. localStorage Hydration Debugging

Auth and chat state are hydrated from localStorage in `StoreProvider.tsx` on mount. If hydrated state is stale:

1. Check the key constants in `src/lib/chatStorageKeys.ts` — confirm the key matches what was written.
2. Check the listener in the store for the correct action trigger.
3. Verify the shape matches the current slice `initialState` — a shape mismatch silently uses the stored (outdated) value.
4. If shape changed, bump the storage key version: `nexusai:user_v2`.

### 4. Diagnosing Unwanted Re-renders

Use these steps in order:

1. Wrap the component in `React.memo` temporarily to confirm it's a parent-caused re-render.
2. Check `useSelector` — if selecting a large object (`state.models.items`), narrow it: `state.models.items.length` or use `createSelector`.
3. Check if a dispatch is inside a `useEffect` with a dependency that changes every render (e.g., an inline object or array).
4. Use Redux DevTools (browser extension) to trace which action triggered the re-render.

### 5. Slice Mutation Rules

**Never mutate state outside of Immer reducers.** RTK uses Immer, so mutations are only safe inside `reducers`:

```ts
// Safe (inside reducer via Immer)
reducers: {
  addMessage: (state, action: PayloadAction<ChatMessage>) => {
    state.messages.push(action.payload); // Immer handles immutability
  }
}

// Dangerous (outside reducer)
const messages = useSelector(state => state.chat.messages);
messages.push(newMessage); // Mutates Redux state directly — forbidden
```

### 6. Async Thunks vs Manual Dispatch

For complex multi-step async flows (fetch → transform → store), prefer `createAsyncThunk` over chained manual dispatches:

```ts
export const loadModels = createAsyncThunk('models/load', async () => {
  const data = await apiModels();
  return data;
});

// Slice handles pending/fulfilled/rejected automatically
extraReducers: builder => {
  builder
    .addCase(loadModels.pending, state => { state.status = 'loading'; })
    .addCase(loadModels.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = 'loaded';
    })
    .addCase(loadModels.rejected, (state, action) => {
      state.status = 'error';
      state.error = action.error.message ?? 'Failed to load models';
    });
}
```

### 7. Common Bugs Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| Loading skeleton never appears | `setXLoading()` not dispatched before async call | Add `dispatch(setXLoading())` before `await` |
| Stale data after login | Listener middleware not triggering on the right action | Check listener `actionCreator` matches the dispatched action |
| Component re-renders on every store change | Selecting entire slice object | Narrow selector to only the fields needed |
| State resets after page refresh | localStorage key mismatch or shape change | Verify key in `chatStorageKeys.ts` and bump version |
| `Cannot read properties of undefined` on state | Async data accessed before `status === 'loaded'` | Guard with `if (status !== 'loaded') return null` |
| Agent builder draft lost on close | `closeBuilder` reducer not preserving draft for edit mode | Check `editingId` is set before opening builder |

## Verification Checklist

- [ ] All async operations dispatch `setXLoading()` before the `await`.
- [ ] Error cases dispatch `setXError(message)` in every `catch` block.
- [ ] Computed data uses `createSelector`, not inline `.filter()`/`.map()` in `useSelector`.
- [ ] localStorage keys are versioned if the slice shape changed.
- [ ] No direct mutation of state arrays/objects outside reducers.

---
*Used to achieve the agentic workflow during Redux debugging, state architecture, and performance optimisation tasks.*
