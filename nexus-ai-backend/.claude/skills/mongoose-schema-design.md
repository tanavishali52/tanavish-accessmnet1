---
description: Designs and updates Mongoose schemas in NexusAI backend. Use when tasks involve creating a new collection, adding fields, defining indexes, or modelling relationships between collections.
---

# Mongoose Schema Design Skill

## Use This Skill When

- Creating a schema for a new feature.
- Adding fields to an existing schema (`User`, `ChatSession`, `ChatMessage`, `Agent`).
- Defining indexes for commonly queried fields.
- Modelling a relationship between two collections.

## Current Collections Reference

| Collection | Schema File | Key Indexes Needed |
|---|---|---|
| `users` | `auth/schemas/user.schema.ts` | `email` (unique) |
| `chats` | `chat/schemas/chat-session.schema.ts` | `sessionId` (unique), `userId + createdAt` |
| `chat_messages` | `chat/schemas/chat-message.schema.ts` | `conversationId + createdAt` |
| `agents` | `agents/schemas/agent.schema.ts` | `userId + isDeleted + createdAt` |

## Schema Template

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MyEntityDocument = HydratedDocument<MyEntity>;

@Schema({ timestamps: true })   // always — adds createdAt + updatedAt automatically
export class MyEntity {

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true, enum: ['draft', 'active', 'archived'], default: 'draft' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const MyEntitySchema = SchemaFactory.createForClass(MyEntity);

// Compound indexes — define after SchemaFactory
MyEntitySchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
```

## Required `@Prop()` Rules by Type

| Type | Required options |
|---|---|
| `string` | `trim: true`, `minlength`, `maxlength` |
| `enum string` | `enum: [...]`, `default: <value>` |
| `ObjectId ref` | `type: Types.ObjectId`, `ref: 'Name'`, `index: true` |
| `boolean flag` | `default: false`, `index: true` |
| `optional date` | `default: null` |
| `string[]` | `type: [String]`, `default: []` |

## Relationship Patterns

**One-to-Many** — child references parent (e.g., ChatMessage → ChatSession):
```ts
@Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true, index: true })
conversationId: Types.ObjectId;
```

**Embedded sub-documents** — only for small, bounded arrays (max ~20 items):
```ts
class Tool { @Prop({ required: true }) id: string; }
@Prop({ type: [Tool], default: [] })
tools: Tool[];
```

## Registering in a Module

```ts
MongooseModule.forFeature([{ name: MyEntity.name, schema: MyEntitySchema }])
```

## Verification Checklist

- [ ] `@Schema({ timestamps: true })` on every new schema.
- [ ] All `string` fields have `trim: true` and length constraints.
- [ ] All enum fields have `default` set.
- [ ] All `ObjectId` refs have `index: true`.
- [ ] Compound indexes defined for every common `find()` + `sort()` combination.
- [ ] Soft delete fields (`isDeleted`, `deletedAt`) on all user-owned entities.
- [ ] Schema registered in the feature module's `MongooseModule.forFeature([...])`.
