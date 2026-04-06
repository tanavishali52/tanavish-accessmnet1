---
description: Designs and updates Mongoose schemas in NexusAI's NestJS backend. Use when tasks involve creating a new MongoDB collection, adding fields to an existing schema, defining indexes, or modelling relationships between collections.
---

# Mongoose Schema Design Skill

## Use This Skill When

- Creating a schema for a new feature (e.g., notifications, payments, reviews).
- Adding fields to an existing schema (`User`, `ChatSession`, `ChatMessage`, `Agent`).
- Defining indexes to speed up common queries.
- Modelling a relationship between two collections.

## Schema Template

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MyEntityDocument = HydratedDocument<MyEntity>;

@Schema({ timestamps: true })   // Always enable — adds createdAt + updatedAt
export class MyEntity {

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 80 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({
    required: true,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const MyEntitySchema = SchemaFactory.createForClass(MyEntity);

// Compound index — define after SchemaFactory
MyEntitySchema.index({ userId: 1, createdAt: -1 });
MyEntitySchema.index({ status: 1, isDeleted: 1 });
```

## Required `@Prop()` Options by Field Type

| Field Type | Required Options |
|---|---|
| `string` | `trim: true`, `minlength`, `maxlength` |
| `enum string` | `enum: [...]`, `default: <value>` |
| `ObjectId ref` | `type: Types.ObjectId`, `ref: 'CollectionName'`, `index: true` |
| `boolean flag` | `default: false`, `index: true` |
| `optional date` | `default: null` |
| `array of strings` | `type: [String]`, `default: []` |
| `array of ObjectIds` | `type: [{ type: Types.ObjectId, ref: '...' }]`, `default: []` |

## Indexing Rules

### Always index these:
- Foreign key references: `userId`, `conversationId`, `sessionId`
- Fields used in `find()` filters: `status`, `isDeleted`, `email`
- Fields used in `sort()`: `createdAt` (descending for most-recent-first queries)

### Compound indexes for combined filters:

```ts
// Index for: findAll({ userId, isDeleted: false }, sort: createdAt DESC)
MyEntitySchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
```

### Unique indexes for uniqueness constraints:

```ts
@Prop({ required: true, unique: true, lowercase: true, trim: true })
email: string;
```

## Relationship Patterns

### One-to-Many (ChatSession → ChatMessages)

Parent stores no array — child references parent:

```ts
// ChatMessage schema
@Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true, index: true })
conversationId: Types.ObjectId;

// Query: get all messages for a session
this.messageModel.find({ conversationId: sessionId }).sort({ createdAt: 1 }).lean()
```

### Many-to-One (Agent references a Model)

Store the model ID as a string (catalog data is static, not a MongoDB document):

```ts
@Prop({ required: true, trim: true })
modelId: string;  // e.g., 'claude-opus-4-6'
```

### Embedded Sub-documents (small, bounded arrays)

For small arrays that always load together with the parent:

```ts
class Tool {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) name: string;
}

@Prop({ type: [Tool], default: [] })
tools: Tool[];
```

Only embed when the array is bounded (e.g., max 20 items). For unbounded data, use a separate collection.

## Registering the Schema in a Module

```ts
// my-entity.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { MyEntity, MyEntitySchema } from './schemas/my-entity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MyEntity.name, schema: MyEntitySchema }]),
  ],
  providers: [MyEntityService],
  controllers: [MyEntityController],
  exports: [MongooseModule],
})
export class MyEntityModule {}
```

## Verification Checklist

- [ ] `@Schema({ timestamps: true })` on every new schema.
- [ ] All `string` fields have `trim: true` and length constraints.
- [ ] All enum fields have `default` set.
- [ ] All foreign key `ObjectId` fields have `ref` and `index: true`.
- [ ] Compound indexes defined for every common `find()` + `sort()` combination.
- [ ] Soft delete fields (`isDeleted`, `deletedAt`) added to user-owned entities.
- [ ] Schema registered in the feature module's `MongooseModule.forFeature([...])`.
