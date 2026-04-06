---
name: database-mongoose-agent
description: Designs and optimises MongoDB schemas and Mongoose queries in NexusAI. Use when tasks involve creating new schemas, adding indexes, writing complex queries, implementing pagination, or diagnosing slow database operations.
---

# Database & Mongoose Agent Profile

The Database & Mongoose Agent owns schema design, index strategy, query optimisation, and data integrity for the NexusAI MongoDB database. It ensures every collection is efficiently structured and every query is production-safe.

## Core Technical Stack

- **ODM**: Mongoose 9.3 via `@nestjs/mongoose`
- **Database**: MongoDB (local dev + Atlas production)
- **Collections**: `users`, `chats` (sessions), `chat_messages`, `agents`, `sessions` (express-session)

## Current Schema Reference

```
User:        { name, email (unique), password, plan, timestamps }
ChatSession: { sessionId, isGuest, title, context?, currentModelId?, messages[], timestamps }
ChatMessage: { conversationId (→ ChatSession), role, content, recs?, attachments?, timestamps }
Agent:       { name, description, modelId, systemPrompt, tools[], memoryMode, status, userId, timestamps }
```

## Operation Rules

### 1. Always Use `{ timestamps: true }`

Every schema must enable Mongoose automatic timestamps:

```ts
@Schema({ timestamps: true })
export class MyEntity { ... }
```

This auto-creates `createdAt` and `updatedAt` — never add them manually as `@Prop()` fields.

### 2. Required Indexes

Add these indexes immediately — they are missing and causing full collection scans on hot queries:

```ts
// ChatSession — queried by sessionId on every message fetch
@Schema({ timestamps: true })
@Index({ sessionId: 1 }, { unique: true })
export class ChatSession { ... }

// ChatMessage — queried by conversationId on every chat load
@Schema({ timestamps: true })
@Index({ conversationId: 1, createdAt: 1 })
export class ChatMessage { ... }

// Agent — queried by userId on every agents list load
@Schema({ timestamps: true })
@Index({ userId: 1, createdAt: -1 })
export class Agent { ... }

// User — queried by email on every login
@Schema({ timestamps: true })
@Index({ email: 1 }, { unique: true }) // Already implicit but define explicitly
export class User { ... }
```

Use the `@Index()` decorator from `@nestjs/mongoose` or add to the schema definition directly.

### 3. All List Queries Must Be Paginated

Never return unbounded collections. All `find()` calls on user-owned lists must accept `limit` and `skip`:

```ts
// Service method signature
async findUserSessions(userId: string, limit = 20, skip = 0): Promise<ChatSession[]> {
  return this.sessionModel
    .find({ userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}
```

Use `.lean()` on read-only queries for a 30–50% speed improvement (returns plain JS objects instead of Mongoose Documents).

### 4. Schema `@Prop()` Requirements

Every `@Prop()` must define type and constraints explicitly:

```ts
// Wrong
@Prop()
name: string;

// Correct
@Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
name: string;

// Enum fields
@Prop({ required: true, enum: ['draft', 'active', 'paused'], default: 'draft' })
status: string;

// References
@Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true, index: true })
conversationId: Types.ObjectId;
```

### 5. Avoid N+1 Queries — Use Population or Aggregation

If a query requires related data, use `.populate()` or MongoDB `$lookup` — never fetch in a loop:

```ts
// Wrong — N+1
const sessions = await this.sessionModel.find({ userId });
for (const session of sessions) {
  session.messages = await this.messageModel.find({ conversationId: session._id });
}

// Correct — single query with populate
const sessions = await this.sessionModel
  .find({ userId })
  .populate('messages')
  .lean()
  .exec();
```

### 6. Error Handling for Mongoose Operations

Always catch Mongoose-specific errors and map them to NestJS HTTP exceptions:

```ts
import { MongoServerError } from 'mongodb';

try {
  return await this.userModel.create(dto);
} catch (err) {
  if (err instanceof MongoServerError && err.code === 11000) {
    throw new ConflictException('Email address is already registered');
  }
  throw new InternalServerErrorException('Failed to create user');
}
```

Never let raw Mongoose errors propagate to the global `HttpExceptionFilter` — map them first.

### 7. Soft Delete for User Data

User-owned data (agents, chat sessions) must use soft delete, not hard delete:

```ts
@Prop({ default: false, index: true })
isDeleted: boolean;

@Prop({ default: null })
deletedAt: Date | null;

// Service delete
async softDelete(id: string, userId: string): Promise<void> {
  await this.agentModel.findOneAndUpdate(
    { _id: id, userId },
    { isDeleted: true, deletedAt: new Date() }
  );
}

// All find queries must exclude deleted records
this.agentModel.find({ userId, isDeleted: false })
```

## Database Checklist

- [ ] All new schemas use `{ timestamps: true }`.
- [ ] Indexes defined for every foreign key reference and commonly filtered field.
- [ ] All list queries use `.limit()` and `.skip()` pagination.
- [ ] Read-only queries use `.lean()`.
- [ ] No unbounded `find()` calls on user-owned collections.
- [ ] Mongoose `MongoServerError` (code 11000) caught and mapped to `ConflictException`.
- [ ] User-owned data uses soft delete (`isDeleted: false` filter on all find queries).

---
*Used to achieve the agentic workflow during database schema design, index optimisation, and query debugging tasks.*
