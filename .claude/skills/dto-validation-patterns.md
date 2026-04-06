---
description: Writes and validates NestJS DTOs in NexusAI backend. Use when tasks involve creating a new request DTO, adding validation rules, handling enum validation, or mapping DTOs to partial update patterns.
---

# DTO Validation Patterns Skill

## Use This Skill When

- Creating a new `CreateXDto` or `UpdateXDto` for a controller.
- Adding missing validators to an existing DTO.
- Validating enum values like `memoryMode`, `status`, or `plan`.
- Writing a DTO for a nested object or array in the request body.

## DTO Template

```ts
import {
  IsString, IsOptional, IsEnum, IsArray, IsInt,
  MinLength, MaxLength, Min, Max, ArrayMaxSize,
  ValidateNested, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ example: 'Research Assistant', minLength: 2, maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'Assists with literature review', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ example: 'claude-opus-4-6' })
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiProperty({ example: 'You are a research assistant...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  systemPrompt: string;

  @ApiPropertyOptional({ type: [String], example: ['web_search', 'file_access'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  tools?: string[];

  @ApiProperty({ enum: ['none', 'short_term', 'short_and_long_term'] })
  @IsEnum(['none', 'short_term', 'short_and_long_term'])
  memoryMode: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'active', 'paused'])
  status?: string;
}
```

## Update DTO — Use PartialType

Never duplicate fields between Create and Update DTOs. Use `PartialType` to make all fields optional:

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {}
```

All validators from `CreateAgentDto` are preserved but every field becomes optional.

## Enum Validation Pattern

Always use `@IsEnum([...])` with an explicit array (or TypeScript enum) — never rely on the schema's `enum` alone:

```ts
// Define the enum once, reuse in both DTO and schema
export const MEMORY_MODES = ['none', 'short_term', 'short_and_long_term'] as const;
export type MemoryMode = typeof MEMORY_MODES[number];

// In DTO
@IsEnum(MEMORY_MODES)
memoryMode: MemoryMode;

// In Schema @Prop
@Prop({ required: true, enum: MEMORY_MODES })
memoryMode: MemoryMode;
```

## Nested Object Validation

For DTOs with nested objects, use `@ValidateNested()` + `@Type(() => NestedDto)`:

```ts
class ContextDto {
  @IsOptional() @IsString() @MaxLength(200) goal?: string;
  @IsOptional() @IsString() @MaxLength(200) audience?: string;
  @IsOptional() @IsString() @MaxLength(100) budget?: string;
}

export class ChatMessageDto {
  @IsString() @IsNotEmpty() @MaxLength(32000)
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContextDto)
  context?: ContextDto;
}
```

## Array of Objects Validation

```ts
class AttachmentDto {
  @IsString() url: string;
  @IsString() name: string;
}

export class SaveMessageDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @ArrayMaxSize(10)
  attachments?: AttachmentDto[];
}
```

## Controller Wiring

The global `ValidationPipe` in `main.ts` handles all DTOs automatically. Never add per-route pipes:

```ts
// main.ts — already configured
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // strips unknown fields
  transform: true,        // converts plain objects to class instances
  forbidNonWhitelisted: true,  // throws on unknown fields
}));

// Controller — just type the parameter
@Post()
create(@Body() dto: CreateAgentDto) {
  return this.agentsService.create(dto);
}
```

## Swagger Annotations

Every DTO property must have `@ApiProperty()` or `@ApiPropertyOptional()`:

```ts
@ApiProperty({
  description: 'The display name of the agent',
  example: 'Research Assistant',
  minLength: 2,
  maxLength: 80,
})
@IsString()
name: string;
```

This generates accurate request body documentation in `/api/docs` automatically.

## Verification Checklist

- [ ] Every field in `CreateXDto` has at least one `class-validator` decorator.
- [ ] `UpdateXDto` uses `PartialType(CreateXDto)` — no duplicate field definitions.
- [ ] Enum fields validated with `@IsEnum([...])` using a shared constant array.
- [ ] Nested objects use `@ValidateNested()` + `@Type(() => NestedDto)`.
- [ ] Arrays use `@IsArray()`, `@ArrayMaxSize()`, and `@Type()` for nested validation.
- [ ] Every property has `@ApiProperty()` or `@ApiPropertyOptional()` for Swagger docs.
- [ ] No manually added `ValidationPipe` on individual routes — global pipe is sufficient.
