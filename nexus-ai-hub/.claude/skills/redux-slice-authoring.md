---
description: Guides writing new Redux slices in NexusAI Hub. Use when tasks involve creating a new slice, adding async actions, wiring localStorage persistence via listener middleware, or adding memoized selectors.
---

# Redux Slice Authoring Skill

## Use This Skill When

- Creating a new Redux slice for a new feature.
- Adding async data-fetching actions to an existing slice.
- Adding localStorage persistence for a slice via listener middleware.
- Migrating component-local state into the Redux store.

## Existing Slices Reference

| Slice | Key State | localStorage Key |
|---|---|---|
| `authSlice` | `user`, `isAuthenticated`, `status` | `nexusai:user` |
| `chatSlice` | `sessions`, `messages`, `onboardPhase` | `CHAT_SESSION_STORAGE_KEY` |
| `agentSlice` | `agents`, `draft`, `builderStep` | — |
| `modelsSlice` | `items`, `labs`, `research`, `status` | — |
| `appSlice` | `activePage`, `activeTab`, `toastVisible` | — |
| `modalSlice` | `isOpen`, `activeModel`, `activeTab` | — |

## Slice Template

```ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

interface MyFeatureState {
  items: MyItem[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error: string | null;
}

const initialState: MyFeatureState = {
  items: [],
  status: 'idle',
  error: null,
};

export const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setMyFeatureLoading: state => {
      state.status = 'loading';
      state.error = null;
    },
    setMyFeature: (state, action: PayloadAction<MyItem[]>) => {
      state.items = action.payload;
      state.status = 'loaded';
      state.error = null;
    },
    setMyFeatureError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    addMyItem: (state, action: PayloadAction<MyItem>) => {
      state.items.push(action.payload);
    },
    removeMyItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

export const {
  setMyFeatureLoading,
  setMyFeature,
  setMyFeatureError,
  addMyItem,
  removeMyItem,
} = myFeatureSlice.actions;

// Memoized selector — never compute derived data inline in useSelector
export const selectActiveItems = createSelector(
  (state: RootState) => state.myFeature.items,
  items => items.filter(i => i.isActive)
);

export default myFeatureSlice.reducer;
```

## Registering in the Store

Add the reducer to `src/store/index.ts`:

```ts
import myFeatureReducer from './myFeatureSlice';

export const store = configureStore({
  reducer: {
    // ...existing
    myFeature: myFeatureReducer,
  },
});
```

## Component Usage Pattern

```tsx
const dispatch = useDispatch();
const { items, status, error } = useSelector((s: RootState) => s.myFeature);

useEffect(() => {
  if (status !== 'idle') return; // guard — prevents repeated fetches
  dispatch(setMyFeatureLoading());
  apiMyFeature()
    .then(data => dispatch(setMyFeature(data)))
    .catch(err => dispatch(setMyFeatureError(err.message)));
}, [status, dispatch]);

if (status === 'loading' || status === 'idle') return <Skeleton />;
if (status === 'error') return <p className="text-red-500">{error}</p>;
```

## localStorage Persistence (Listener Middleware)

```ts
// In src/store/index.ts
listenerMiddleware.startListening({
  actionCreator: setMyFeature,
  effect: (_action, api) => {
    const state = api.getState() as RootState;
    localStorage.setItem('nexusai:myFeature', JSON.stringify(state.myFeature.items));
  },
});
```

Hydrate in `StoreProvider.tsx` on mount:

```ts
const stored = localStorage.getItem('nexusai:myFeature');
if (stored) store.dispatch(setMyFeature(JSON.parse(stored)));
```

## Verification Checklist

- [ ] State shape includes `status: 'idle' | 'loading' | 'loaded' | 'error'` and `error: string | null`.
- [ ] Three status actions: `setXLoading`, `setX` (sets `loaded`), `setXError`.
- [ ] Reducer registered in `src/store/index.ts`.
- [ ] Component guards render with `if (status !== 'loaded')`.
- [ ] Derived data uses `createSelector` — not inline `.filter()` inside `useSelector`.
- [ ] No `any` in state shape or `PayloadAction` generics.
