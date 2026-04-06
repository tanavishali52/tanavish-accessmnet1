---
description: Guides writing new Redux slices in NexusAI Hub. Use when tasks involve creating a new slice, adding actions to an existing slice, wiring async data fetching, or adding localStorage persistence via listener middleware.
---

# Redux Slice Authoring Skill

## Use This Skill When

- Creating a new Redux slice for a new feature.
- Adding async data fetching actions to an existing slice.
- Adding localStorage persistence for a slice via listener middleware.
- Migrating component-local state into the Redux store.

## Slice Template

Every slice in NexusAI follows this exact structure:

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the state shape — no `any`
interface MyFeatureState {
  items: MyItem[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  error: string | null;
}

// 2. Define initial state
const initialState: MyFeatureState = {
  items: [],
  status: 'idle',
  error: null,
};

// 3. Create the slice
export const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    // Loading started
    setMyFeatureLoading: state => {
      state.status = 'loading';
      state.error = null;
    },
    // Data loaded successfully
    setMyFeature: (state, action: PayloadAction<MyItem[]>) => {
      state.items = action.payload;
      state.status = 'loaded';
      state.error = null;
    },
    // Error occurred
    setMyFeatureError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    // Additional mutation
    addMyItem: (state, action: PayloadAction<MyItem>) => {
      state.items.push(action.payload);
    },
    removeMyItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
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

export default myFeatureSlice.reducer;
```

## Wiring Into the Store

After creating the slice, register it in `src/store/index.ts`:

```ts
import myFeatureReducer from './myFeatureSlice';

export const store = configureStore({
  reducer: {
    // ...existing reducers
    myFeature: myFeatureReducer,
  },
});

// Update RootState type automatically
export type RootState = ReturnType<typeof store.getState>;
```

## Using the Slice in a Component

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setMyFeatureLoading, setMyFeature, setMyFeatureError } from '@/store/myFeatureSlice';
import { apiMyFeature } from '@/lib/api';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state: RootState) => state.myFeature);

  useEffect(() => {
    if (status !== 'idle') return;
    dispatch(setMyFeatureLoading());
    apiMyFeature()
      .then(data => dispatch(setMyFeature(data)))
      .catch(err => dispatch(setMyFeatureError(err.message)));
  }, [status, dispatch]);

  if (status === 'loading') return <Skeleton />;
  if (status === 'error') return <p>{error}</p>;
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
};
```

## Adding localStorage Persistence (Listener Middleware)

To persist a slice's state to localStorage when a specific action fires, add a listener in `src/store/index.ts`:

```ts
listenerMiddleware.startListening({
  actionCreator: setMyFeature,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    localStorage.setItem('nexusai:myFeature', JSON.stringify(state.myFeature.items));
  },
});
```

To hydrate on app load, read from localStorage in `StoreProvider.tsx`:

```ts
const stored = localStorage.getItem('nexusai:myFeature');
if (stored) {
  store.dispatch(setMyFeature(JSON.parse(stored)));
}
```

## Memoized Selectors

For any derived data, use `createSelector` — never compute inside `useSelector`:

```ts
import { createSelector } from '@reduxjs/toolkit';

export const selectActiveItems = createSelector(
  (state: RootState) => state.myFeature.items,
  items => items.filter(item => item.isActive)
);
```

## Verification Checklist

- [ ] State shape has `status: 'idle' | 'loading' | 'loaded' | 'error'` and `error: string | null`.
- [ ] Three status actions exist: `setXLoading`, `setX`, `setXError`.
- [ ] Reducer is registered in `src/store/index.ts` and `RootState` is updated.
- [ ] Component guards rendering with `if (status !== 'loaded')`.
- [ ] Derived data uses `createSelector`, not inline filter in `useSelector`.
