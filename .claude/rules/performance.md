# Performance Rules

Every feature in NexusAI must be designed to perform at scale. These rules prevent the most common performance regressions found in the codebase.

## 1. Mandatory Pagination on All List Endpoints

Any backend endpoint that returns a list of user-owned records **must** accept `limit` and `skip` query parameters. There must be no unbounded `find()` calls in services.

```ts
// Required signature for all list service methods
async findAll(userId: string, limit = 20, skip = 0): Promise<T[]> {
  return this.model
    .find({ userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}
```

**Limit cap**: Never allow `limit` greater than 100 in a single request. Enforce in the service:

```ts
const safeLimit = Math.min(limit, 100);
```

## 2. Use `.lean()` on Read-Only Queries

Mongoose Documents carry Mongoose overhead (getters, setters, methods). For data that is only read and returned (not mutated), always call `.lean()`:

```ts
// Returns a plain JS object — ~30-50% faster for large result sets
this.agentModel.find({ userId }).lean().exec()
```

Do NOT use `.lean()` when you need to call `.save()` on the returned document.

## 3. Catalog Data Caching

The catalog module returns 50+ models and 30+ research papers on every app boot. This data is static (rarely changes). It must be cached in memory with a TTL instead of reconstructing the array on every request:

```ts
// In CatalogService
private modelsCache: { data: Model[]; expiresAt: number } | null = null;
private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

getModels(): Model[] {
  if (this.modelsCache && Date.now() < this.modelsCache.expiresAt) {
    return this.modelsCache.data;
  }
  const data = this.buildModelsData();
  this.modelsCache = { data, expiresAt: Date.now() + this.CACHE_TTL };
  return data;
}
```

## 4. Frontend: Memoized Selectors Only

Never compute derived data inside `useSelector` — it re-runs on every store update:

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

## 5. Frontend: No Redundant API Calls

The `CatalogBootstrap` provider fetches models, labs, agents, and research once on app load. Components must not re-fetch data that is already in the store:

```ts
// In a component — check status before fetching
const { items, status } = useSelector((state: RootState) => state.models);
useEffect(() => {
  if (status !== 'idle') return; // already loading or loaded
  dispatch(setModelsLoading());
  apiModels().then(data => dispatch(setModels(data)));
}, [status]);
```

The `status !== 'idle'` guard is mandatory — omitting it causes repeated API calls on every render cycle.

## 6. Frontend: next/image for All Catalog Icons

Model and lab icons must use `next/image` for automatic optimisation (WebP conversion, lazy loading, size constraints). Raw `<img>` tags are not allowed for remote images:

```tsx
import Image from 'next/image';

// Correct
<Image src={model.icon} alt={model.name} width={40} height={40} />

// Wrong
<img src={model.icon} alt={model.name} />
```

## 7. Avoid N+1 Database Queries

Never fetch related data in a loop. Use `.populate()` or MongoDB aggregation `$lookup`:

```ts
// Wrong — N queries for N sessions
const sessions = await this.sessionModel.find({ userId });
for (const s of sessions) {
  s.lastMessage = await this.messageModel.findOne({ conversationId: s._id });
}

// Correct — single aggregation
const sessions = await this.sessionModel.aggregate([
  { $match: { userId } },
  { $lookup: { from: 'chat_messages', localField: '_id', foreignField: 'conversationId', as: 'messages' } },
]);
```

## 8. Chat Message Pagination

The chat module must not load all messages for a session in one query. Implement cursor-based or offset pagination:

```ts
// Default: load last 50 messages, older ones fetched on scroll
async getMessages(sessionId: string, limit = 50, before?: Date): Promise<ChatMessage[]> {
  const filter: object = { conversationId: sessionId };
  if (before) Object.assign(filter, { createdAt: { $lt: before } });
  return this.messageModel
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
}
```

## 9. Bundle Size Awareness

Before adding a new npm dependency to the frontend:

- Check the bundle impact at bundlephobia.com.
- If the library is used in one place and adds more than 20KB gzipped, find a lighter alternative or implement the functionality inline.
- Use dynamic imports for heavy components not needed on initial load:

```tsx
const AgentBuilder = dynamic(() => import('@/components/app/agents/AgentBuilder'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});
```
