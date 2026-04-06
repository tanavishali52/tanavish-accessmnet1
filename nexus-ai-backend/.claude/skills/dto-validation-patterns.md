---
description: Writes and validates NestJS DTOs in NexusAI backend. Use when tasks involve creating a new request DTO, adding validators, handling enums, or writing partial update DTOs.
---

# DTO Validation Patterns Skill

## Use This Skill When

- Creating a new `CreateXDto` or `UpdateXDto` for a controller.
- Adding missing validators to an existing DTO.
- Validating enum fields like `memoryMode`, `status`, or `plan`.
- Writing a DTO for nested objects or arrays in the request body.

## DTO Template

```ts
import {
  IsString, IsOptional, IsEnum, IsArray, IsNotEmpty,
  MinLength, MaxLength, ArrayMaxSize, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ example: 'Research Assistant', minLength: 2, maxLength: 80 })
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional() @IsString() @MaxLength(300)
  description?: string;

  @ApiProperty({ example: 'claude-opus-4-6' })
  @IsString() @IsNotEmpty()
  modelId: string;

  @ApiProperty({ maxLength: 2000 })
  @IsString() @IsNotEmpty() @MaxLength(2000)
  systemPrompt: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(12)
  tools?: string[];

  @ApiProperty({ enum: ['none', 'short_term', 'short_and_long_term'] })
  @IsEnum(['none', 'short_term', 'short_and_long_term'])
  memoryMode: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused'], default: 'draft' })
  @IsOptional() @IsEnum(['draft', 'active', 'paused'])
  status?: string;
}
```

## Update DTO — Always Use PartialType

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {}
```

Never duplicate field definitions between Create and Update DTOs.

## Shared Enum Constants

Define enums as shared constants — reuse in both DTO and schema:

```ts
export const MEMORY_MODES = ['none', 'short_term', 'short_and_long_term'] as const;
export type MemoryMode = typeof MEMORY_MODES[number];

// DTO: @IsEnum(MEMORY_MODES)
// Schema @Prop: { enum: MEMORY_MODES }
```

## Nested Object Validation

```ts
class ContextDto {
  @IsOptional() @IsString() @MaxLength(200) goal?: string;
  @IsOptional() @IsString() @MaxLength(200) audience?: string;
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

## Controller Wiring

The global `ValidationPipe` in `main.ts` handles all DTOs — never add per-route pipes:

```ts
// main.ts — already configured
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}));

// Controller — just type the parameter
@Post()
create(@Body() dto: CreateAgentDto) { ... }
```

## Verification Checklist

- [ ] Every field has at least one `class-validator` decorator.
- [ ] `UpdateXDto` extends `PartialType(CreateXDto)` — no duplicated fields.
- [ ] Enum fields use `@IsEnum([...])` with a shared constant array.
- [ ] Nested objects use `@ValidateNested()` + `@Type(() => NestedDto)`.
- [ ] Every property has `@ApiProperty()` or `@ApiPropertyOptional()` for Swagger.
- [ ] No per-route `ValidationPipe` — global pipe is sufficient.
