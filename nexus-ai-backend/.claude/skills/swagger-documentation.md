---
description: Adds and maintains Swagger/OpenAPI documentation in NexusAI backend. Use when tasks involve annotating a new controller, documenting request/response shapes, tagging endpoints, or keeping /api/docs accurate.
---

# Swagger Documentation Skill

## Use This Skill When

- A new controller or route is added and needs Swagger annotations.
- An existing endpoint's shape changed and the docs are stale.
- Adding grouped tags to organise `/api/docs` by feature.
- Documenting auth requirements on protected endpoints.

## Controller-Level Tag

Every controller must have `@ApiTags()`:

```ts
@ApiTags('Agents')         // Groups all routes under "Agents" in /api/docs
@Controller('agents')
export class AgentsController { ... }
```

Standard tags: `Auth` · `Agents` · `Catalog` · `Chat`

## Route-Level Annotations

```ts
@ApiOperation({ summary: 'Create a new agent' })
@ApiBody({ type: CreateAgentDto })
@ApiResponse({ status: 201, description: 'Agent created successfully', type: AgentResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Authentication required' })
@Post()
create(@Body() dto: CreateAgentDto) { ... }
```

## Standard Response Status Codes

| Scenario | Status |
|---|---|
| Created | 201 |
| Fetched / Updated / Deleted | 200 |
| Validation error | 400 |
| Unauthenticated | 401 |
| Forbidden (plan/ownership) | 403 |
| Not found | 404 |
| Conflict (duplicate) | 409 |

## Path & Query Parameters

```ts
@ApiParam({ name: 'id', description: 'Agent ID (MongoDB ObjectId)', example: '665abc...' })
@Get(':id')
findOne(@Param('id') id: string) { ... }

@ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
@ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
@Get()
findAll(@Query('limit') limit = 20, @Query('skip') skip = 0) { ... }
```

## Auth-Protected Routes

```ts
@ApiBearerAuth()        // shows lock icon in Swagger UI
@UseGuards(AuthGuard)
@Get()
findAll() { ... }
```

## Response DTO

Create a response DTO to document the shape of the `data` field in the global response wrapper:

```ts
export class AgentResponseDto {
  @ApiProperty({ example: '665abc123' }) _id: string;
  @ApiProperty({ example: 'Research Assistant' }) name: string;
  @ApiProperty({ enum: ['draft', 'active', 'paused'] }) status: string;
}
```

## Deprecating a Route

```ts
@ApiOperation({ summary: 'Get agents (deprecated — use /v2/agents)', deprecated: true })
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
  @ApiResponse({ status: 201, type: AgentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateAgentDto) { ... }

  @ApiOperation({ summary: 'List all agents for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiResponse({ status: 200, type: [AgentResponseDto] })
  @Get()
  findAll(@Req() req: Request) { ... }
}
```

## Verification Checklist

- [ ] Every controller has `@ApiTags('<Group>')`.
- [ ] Every route has `@ApiOperation({ summary: '...' })`.
- [ ] All success and common error responses documented with `@ApiResponse`.
- [ ] Path params use `@ApiParam`, query params use `@ApiQuery`.
- [ ] Protected routes have `@ApiBearerAuth()`.
- [ ] Deprecated routes marked with `deprecated: true`.
- [ ] `/api/docs` loads without errors after adding annotations.
