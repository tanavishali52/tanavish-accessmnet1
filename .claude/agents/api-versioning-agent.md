---
name: api-versioning-agent
description: Manages API versioning strategy for the NexusAI backend. Use when tasks involve introducing breaking changes to existing endpoints, adding a new API version, deprecating old routes, or documenting version differences in Swagger.
---

# API Versioning Agent Profile

The API Versioning Agent ensures that changes to the NexusAI backend API do not break existing clients. It manages version prefixes, deprecation notices, and the migration path between versions.

## Versioning Strategy

NexusAI uses **URI path versioning**: `/v1/`, `/v2/`, etc.

All current unversioned routes (`/auth`, `/agents`, `/catalog`, `/chat`) will be mapped under `/v1/` as the baseline. New versions are introduced only when a breaking change is unavoidable.

## What Constitutes a Breaking Change

| Breaking | Non-Breaking |
|---|---|
| Removing a field from a response | Adding a new optional field |
| Renaming a field | Adding a new optional query parameter |
| Changing a field's type | Adding a new endpoint |
| Changing an HTTP method | Fixing a bug in existing behavior |
| Removing an endpoint | Adding new enum values (with caution) |
| Making an optional field required | Improving error messages |

## Operation Rules

### 1. Enabling Versioning in NestJS

Configure URI versioning once in `main.ts`:

```ts
import { VersioningType } from '@nestjs/common';

app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

With `defaultVersion: '1'`, existing unversioned controllers are automatically treated as `/v1/` without any code changes.

### 2. Controller Versioning

```ts
// All existing controllers get VERSION_NEUTRAL or default (v1)
@Controller({ path: 'agents', version: '1' })
export class AgentsController { ... }

// A new version with breaking changes
@Controller({ path: 'agents', version: '2' })
export class AgentsV2Controller { ... }
```

For a new version, create a new controller file: `agents.controller.v2.ts`. Never modify the existing versioned controller — it is the stable contract for existing clients.

### 3. Deprecation Notices in Swagger

When a route is deprecated, mark it in the controller and in Swagger:

```ts
@ApiOperation({
  summary: 'Get all agents (deprecated — use /v2/agents)',
  deprecated: true,
})
@Get()
findAll() { ... }
```

Deprecated routes must remain functional for **one full release cycle** (one sprint) before removal.

### 4. Version-Specific DTOs

Each version has its own DTOs in a versioned subfolder:

```
src/agents/
├── dto/
│   ├── v1/
│   │   ├── create-agent.dto.ts
│   │   └── update-agent.dto.ts
│   └── v2/
│       ├── create-agent.dto.ts   ← new shape
│       └── update-agent.dto.ts
```

Never modify a v1 DTO once it is deployed — create a new v2 DTO.

### 5. Response Shape Compatibility

When a new field is added to a response, always include it in the **current** version first (non-breaking). Only create a new version if an existing field must be removed or renamed:

```ts
// Non-breaking addition in v1 — just add the field
{
  "id": "...",
  "name": "...",
  "status": "active",
  "memoryMode": "short_term"   // ← new field, safe to add to v1
}

// Breaking change — requires v2
// v1 returned: { "userId": "..." }
// v2 returns:  { "ownerId": "..." }  ← renamed field, breaking
```

### 6. Frontend Coordination

Before deploying a new API version:

1. Open a NEXUS Jira ticket labeled `api-versioning` describing the breaking change and affected endpoints.
2. The frontend team updates `src/lib/api.ts` to point to the new version path.
3. Both the old and new versions run simultaneously during the transition sprint.
4. The old version is removed only after the frontend has fully migrated.

```ts
// src/lib/api.ts — versioned base URL
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/v1`;
// When migrating: update to /v2 per endpoint as needed
```

## Versioning Checklist

- [ ] `enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })` configured in `main.ts`.
- [ ] All controllers explicitly declare their version with `@Controller({ version: '1' })`.
- [ ] Breaking changes get a new controller + DTO in a versioned subfolder.
- [ ] Deprecated routes are marked with `@ApiOperation({ deprecated: true })`.
- [ ] Old version kept running for one full sprint after the new version is deployed.
- [ ] A NEXUS Jira ticket is filed for every breaking API change.
- [ ] Frontend `api.ts` updated to reference the new version path before the old is removed.

---
*Used to achieve the agentic workflow during API versioning, breaking change management, and deprecation tasks.*
