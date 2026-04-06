---
description: Adds and maintains Swagger/OpenAPI documentation in the NexusAI NestJS backend. Use when tasks involve annotating a new controller, documenting request/response shapes, tagging endpoints, or keeping /api/docs accurate after a change.
---

# Swagger Documentation Skill

## Use This Skill When

- A new controller or route is added and needs Swagger annotations.
- An existing endpoint's request/response shape changed and the docs are stale.
- Adding grouped tags so `/api/docs` is organised by feature.
- Documenting auth requirements (`session required`) on protected endpoints.

## Controller-Level Annotations

Every controller must have `@ApiTags()` to group its routes in the Swagger UI:

```ts
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController { ... }
```

Standard tag names:
- `Auth` — `/auth/*`
- `Agents` — `/agents/*`
- `Catalog` — `/catalog/*`
- `Chat` — `/chat/*`

## Route-Level Annotations

Every route method needs `@ApiOperation` at minimum. Add `@ApiResponse` for all meaningful status codes:

```ts
import {
  ApiOperation, ApiResponse, ApiParam,
  ApiQuery, ApiBody, ApiBearerAuth,
} from '@nestjs/swagger';

@ApiOperation({ summary: 'Create a new agent' })
@ApiBody({ type: CreateAgentDto })
@ApiResponse({ status: 201, description: 'Agent created successfully', type: AgentResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Authentication required' })
@Post()
create(@Body() dto: CreateAgentDto) { ... }
```

## Standard Response Status Codes

| Scenario | Status | Description string |
|---|---|---|
| Created successfully | 201 | `'<Resource> created successfully'` |
| Fetched successfully | 200 | `'<Resource> retrieved successfully'` |
| Updated successfully | 200 | `'<Resource> updated successfully'` |
| Deleted successfully | 200 | `'<Resource> deleted successfully'` |
| Validation error | 400 | `'Validation error'` |
| Unauthenticated | 401 | `'Authentication required'` |
| Forbidden (plan/ownership) | 403 | `'Access denied'` |
| Not found | 404 | `'<Resource> not found'` |
| Conflict (duplicate) | 409 | `'<Resource> already exists'` |

## Path Parameters

```ts
@ApiParam({ name: 'id', description: 'Agent ID (MongoDB ObjectId)', example: '665abc123...' })
@Get(':id')
findOne(@Param('id') id: string) { ... }
```

## Query Parameters

```ts
@ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
@ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
@Get()
findAll(
  @Query('limit') limit = 20,
  @Query('skip') skip = 0,
) { ... }
```

## Marking Auth-Protected Routes

Tag session-protected routes so they show the lock icon in Swagger UI:

```ts
// In main.ts — already configured, no change needed
const config = new DocumentBuilder()
  .addCookieAuth('connect.sid')
  .build();

// On protected controller or individual route
@ApiBearerAuth()   // shows lock icon in Swagger
@UseGuards(AuthGuard)
@Get()
findAll() { ... }
```

## Response DTO for Swagger Types

Create a response DTO so Swagger can document the `data` field of the global `ResponseInterceptor` wrapper:

```ts
// src/agents/dto/agent-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AgentResponseDto {
  @ApiProperty({ example: '665abc123def456789' })
  _id: string;

  @ApiProperty({ example: 'Research Assistant' })
  name: string;

  @ApiProperty({ enum: ['draft', 'active', 'paused'], example: 'active' })
  status: string;
}
```

## Deprecating an Endpoint

```ts
@ApiOperation({
  summary: 'Get agents (deprecated — use /v2/agents)',
  deprecated: true,
})
@Get()
findAll() { ... }
```

## Full Annotated Example

```ts
@ApiTags('Agents')
@UseGuards(AuthGuard)
@Controller({ path: 'agents', version: '1' })
export class AgentsController {

  @ApiOperation({ summary: 'Create a new agent' })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({ status: 201, description: 'Agent created successfully', type: AgentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateAgentDto) { ... }

  @ApiOperation({ summary: 'Get all agents for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Agents retrieved', type: [AgentResponseDto] })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @Get()
  findAll(@Req() req: Request, @Query('limit') limit = 20, @Query('skip') skip = 0) { ... }

  @ApiOperation({ summary: 'Delete an agent by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent deleted' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  @Delete(':id')
  remove(@Param('id') id: string) { ... }
}
```

## Verification Checklist

- [ ] Every controller has `@ApiTags('<Group>')`.
- [ ] Every route has `@ApiOperation({ summary: '...' })`.
- [ ] Every route documents its success and common error responses with `@ApiResponse`.
- [ ] Path params use `@ApiParam`, query params use `@ApiQuery`.
- [ ] Auth-protected routes have `@ApiBearerAuth()` or `@ApiCookieAuth()`.
- [ ] Deprecated routes are marked with `deprecated: true` in `@ApiOperation`.
- [ ] `/api/docs` loads without errors after adding annotations.
