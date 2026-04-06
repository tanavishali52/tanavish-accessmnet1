# Database Rules

All MongoDB schema design, query patterns, and data management in NexusAI backend must follow these rules.

## 1. Always Enable Timestamps

Every schema must use `@Schema({ timestamps: true })`. Never define `createdAt` or `updatedAt` manually as `@Prop()` fields.

## 2. Mandatory Indexes

Required indexes on existing collections:

| Collection | Index | Type |
|---|---|---|
| `users` | `email` | Unique |
| `chats` | `sessionId` | Unique |
| `chats` | `userId + createdAt` | Compound |
| `chat_messages` | `conversationId + createdAt` | Compound |
| `agents` | `userId + isDeleted + createdAt` | Compound |

For every new schema: define indexes on all foreign key references and all fields used in `find()` filters or `sort()`.

Define compound indexes after `SchemaFactory.createForClass()`:
```ts
AgentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
```

## 3. Soft Delete — Never Hard Delete User Data

User-owned data must never be permanently deleted. All user-owned schemas must include:

```ts
@Prop({ default: false, index: true }) isDeleted: boolean;
@Prop({ default: null }) deletedAt: Date | null;
```

All `find()` queries on these collections must include `isDeleted: false`.

## 4. All List Queries Must Be Paginated

No `find()` on a user-owned collection may return an unbounded result set:

```ts
async findAll(userId: string, limit = 20, skip = 0) {
  return this.model
    .find({ userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(limit, 100))  // cap at 100
    .lean()
    .exec();
}
```

## 5. Use `.lean()` on Read-Only Queries

Any query where the result is only read and returned (not mutated with `.save()`) must call `.lean()` for better performance.

## 6. Map Duplicate Key Errors

`MongoServerError` code `11000` must be caught and mapped to `ConflictException` before it reaches the global filter.

## 7. Strict Schema Field Constraints

All string `@Prop()` fields must define `trim`, `minlength`, and `maxlength`. Enum fields must define `default`. ObjectId references must define `ref` and `index: true`. No bare `@Prop()` with no options.

## 8. No `any` in Schemas or Query Filters

Query filter objects must be typed interfaces — not `{}`, `object`, or `any`. Schema `@Prop()` types must be explicit TypeScript types.
