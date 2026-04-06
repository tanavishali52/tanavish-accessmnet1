# Database Rules

All MongoDB schema design, query patterns, and data management in NexusAI must follow these rules to ensure correctness, performance, and data safety.

## 1. Always Enable Timestamps

Every Mongoose schema must use `{ timestamps: true }`. Never define `createdAt` or `updatedAt` as manual `@Prop()` fields:

```ts
// Correct
@Schema({ timestamps: true })
export class Agent { ... }

// Wrong — manual timestamps are error-prone and redundant
@Prop() createdAt: Date;
@Prop() updatedAt: Date;
```

## 2. Mandatory Indexes

The following indexes are required on existing and new schemas:

| Collection | Index | Type |
|---|---|---|
| `users` | `email` | Unique |
| `chats` (sessions) | `sessionId` | Unique |
| `chats` | `userId + createdAt` | Compound |
| `chat_messages` | `conversationId + createdAt` | Compound |
| `agents` | `userId + isDeleted + createdAt` | Compound |

For every new schema, define indexes on all foreign key references and all fields used in `find()` filters or `sort()`.

Define compound indexes after `SchemaFactory.createForClass()`:

```ts
export const AgentSchema = SchemaFactory.createForClass(Agent);
AgentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
```

## 3. Soft Delete — Never Hard Delete User Data

User-owned data (`agents`, `chats`, `chat_messages`) must never be permanently deleted. Use soft delete:

```ts
@Prop({ default: false, index: true })
isDeleted: boolean;

@Prop({ default: null })
deletedAt: Date | null;
```

All `find()` queries on soft-deletable collections must include `isDeleted: false`:

```ts
// Required filter on every user-owned query
this.agentModel.find({ userId, isDeleted: false })
```

Hard delete is only permitted for: temporary guest session data after a defined TTL (e.g., 7 days).

## 4. All List Queries Must Be Paginated

No `find()` call on a user-owned collection may return an unbounded result set. All service methods that return lists must accept `limit` and `skip`:

```ts
async findAll(userId: string, limit = 20, skip = 0): Promise<Agent[]> {
  const safeLimit = Math.min(limit, 100); // cap at 100
  return this.agentModel
    .find({ userId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .lean()
    .exec();
}
```

## 5. Use `.lean()` on Read-Only Queries

Any query where the result is only read and returned (not mutated with `.save()`) must call `.lean()` for a significant performance improvement:

```ts
// Correct — returns plain JS objects, not Mongoose Documents
.find({ userId }).lean().exec()

// Only omit .lean() when you need to call .save() on the result
const agent = await this.agentModel.findById(id); // no .lean()
agent.status = 'active';
await agent.save();
```

## 6. Handle Duplicate Key Errors Explicitly

Never let Mongoose `MongoServerError` (code 11000) bubble up as a 500. Map it to a `ConflictException`:

```ts
import { MongoServerError } from 'mongodb';

try {
  return await this.userModel.create(dto);
} catch (err) {
  if (err instanceof MongoServerError && err.code === 11000) {
    throw new ConflictException('This email address is already registered');
  }
  throw new InternalServerErrorException('Failed to create user');
}
```

## 7. No Arbitrary `any` in Schemas or Queries

All schema `@Prop()` definitions must use explicit TypeScript types. Query filter objects must be typed — do not use `{}` or `object` as a catch-all:

```ts
// Wrong
const filter: any = { userId };

// Correct
interface AgentFilter {
  userId: string;
  isDeleted: boolean;
  status?: string;
}
const filter: AgentFilter = { userId, isDeleted: false };
```

## 8. Schema Field Constraints

Every string `@Prop()` must define `trim`, `minlength`, and `maxlength`. Every enum `@Prop()` must define `default`. Foreign key `ObjectId` references must define `ref` and `index: true`:

```ts
@Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
name: string;

@Prop({ required: true, enum: ['draft', 'active', 'paused'], default: 'draft' })
status: string;

@Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
userId: Types.ObjectId;
```

## 9. Test Database Isolation

Unit tests must never use the real database — mock the Mongoose model. E2E tests must use a separate `MONGODB_URI_TEST` database that is seeded fresh before each test run and cleaned up after.
