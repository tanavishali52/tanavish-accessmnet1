# Performance Rules

All NexusAI backend services must be designed to perform efficiently under realistic load.

## 1. Pagination on All List Endpoints

Every endpoint returning a list of user-owned records must accept `limit` (default 20, max 100) and `skip` (default 0). No unbounded `find()` calls in services.

## 2. `.lean()` on Read-Only Queries

Call `.lean()` on any Mongoose query where the result is only returned — not mutated with `.save()`. Returns plain JS objects instead of Mongoose Documents, giving ~30–50% speed improvement.

## 3. In-Memory Caching for Static Catalog Data

The catalog module serves 50+ models and 30+ research papers — data that rarely changes. It must be cached in-memory with a TTL:

```ts
private cache: { data: Model[]; expiresAt: number } | null = null;
private TTL = 5 * 60 * 1000; // 5 minutes

getModels(): Model[] {
  if (this.cache && Date.now() < this.cache.expiresAt) return this.cache.data;
  const data = this.buildModels();
  this.cache = { data, expiresAt: Date.now() + this.TTL };
  return data;
}
```

## 4. No N+1 Queries

Never fetch related data in a loop. Use `.populate()` or MongoDB aggregation `$lookup` for related documents.

## 5. Compound Indexes for Common Query Patterns

Every `find()` that filters by multiple fields AND sorts must have a matching compound index. A missing index turns an O(log n) query into an O(n) full collection scan.

## 6. Chat Message Pagination

Never load all messages for a session in one query. Load the most recent N (default 50) and support cursor-based loading for older messages using `createdAt: { $lt: before }`.

## 7. Session Store TTL

Express-session documents in MongoDB must have a TTL index configured on `expires`. Guest sessions should expire after 7 days; authenticated sessions after 14 days. Never accumulate stale session documents indefinitely.

## 8. Avoid Synchronous File Operations in Request Handlers

File cleanup (`fs.unlinkSync`) in request handlers blocks the event loop. Move cleanup to a background task or use `fs.unlink` (async) instead:

```ts
fs.unlink(filePath, err => { if (err) console.error('Cleanup failed', err); });
```
