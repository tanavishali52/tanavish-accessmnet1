# Performance Rules

Every feature in NexusAI Hub must be designed to avoid unnecessary renders, redundant API calls, and excessive bundle size.

## 1. Memoized Selectors — No Inline Derivation in useSelector

Never compute derived data inside `useSelector`. Always use `createSelector`:

```ts
// Wrong — filter runs on every dispatch anywhere in the app
const active = useSelector(state => state.agent.agents.filter(a => a.status === 'active'));

// Correct
export const selectActiveAgents = createSelector(
  (state: RootState) => state.agent.agents,
  agents => agents.filter(a => a.status === 'active')
);
const active = useSelector(selectActiveAgents);
```

## 2. No Redundant API Calls

Always guard fetches with a `status !== 'idle'` check. The `CatalogBootstrap` provider already fetches models, labs, research, and agents on app load — components must not re-fetch data that is already in the store:

```ts
useEffect(() => {
  if (status !== 'idle') return; // prevents re-fetch on every render
  dispatch(setModelsLoading());
  apiModels().then(data => dispatch(setModels(data)));
}, [status, dispatch]);
```

## 3. next/image for All Remote Images

Use `next/image` instead of `<img>` for all remote catalog icons and model images. This enables automatic WebP conversion, lazy loading, and size optimisation:

```tsx
import Image from 'next/image';
<Image src={model.icon} alt={model.name} width={40} height={40} />
```

## 4. Dynamic Imports for Heavy Components

Lazy-load components that are not needed on initial render (AgentBuilder modal, ResearchDetailView):

```tsx
import dynamic from 'next/dynamic';

const AgentBuilder = dynamic(
  () => import('@/components/app/agents/AgentBuilder'),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
```

## 5. No Animation on High-Frequency Re-render Elements

Do not add Framer Motion `motion.*` wrappers to elements that re-render on every keystroke (chat input area, live search results updating). Animation triggers layout recalculations on every render.

## 6. Skeleton Before Data — Never Empty Views

Always show a skeleton during `'loading'` and `'idle'` states. A blank screen while data loads is worse UX and causes layout shift. See the `skeleton-loading` skill for patterns.

## 7. Avoid Prop Drilling Through 3+ Levels

If a value is needed by a component more than 2 levels down, put it in Redux instead of threading it through props. Deep prop drilling causes unnecessary parent re-renders when the value changes.

## 8. Bundle Size — Check Before Adding Dependencies

Before adding a new npm package, check its bundle size. If it adds more than 20KB gzipped for a single-use case, find a lighter alternative or implement inline. Run `npm run build` and check the `/_next/static/chunks/` output for unexpected size increases.
