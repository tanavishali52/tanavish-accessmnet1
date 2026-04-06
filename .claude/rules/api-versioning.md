# API Versioning Rules

All NexusAI backend API changes must follow this versioning policy to ensure existing clients are never broken without a planned migration path.

## 1. URI Path Versioning

NexusAI uses URI path versioning. All routes are prefixed `/v1/`, `/v2/`, etc. The NestJS versioning module is configured in `main.ts`:

```ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

With `defaultVersion: '1'`, existing controllers automatically serve under `/v1/` without requiring code changes.

## 2. All Controllers Must Declare Their Version

Every controller must explicitly declare its version — never rely on implicit defaults alone:

```ts
@Controller({ path: 'agents', version: '1' })
export class AgentsController { ... }
```

## 3. What Is a Breaking Change

A new API version is required **only** for breaking changes. The following are breaking:

| Breaking | Requires New Version |
|---|---|
| Removing a response field | Yes |
| Renaming a field | Yes |
| Changing a field's type | Yes |
| Removing an endpoint | Yes |
| Changing an HTTP method | Yes |
| Making an optional field required | Yes |

The following are **not** breaking and may be added to the current version:

| Non-Breaking | Allowed in Current Version |
|---|---|
| Adding a new optional response field | Yes |
| Adding a new optional query parameter | Yes |
| Adding a new endpoint | Yes |
| Fixing a bug | Yes |
| Improving an error message | Yes |

## 4. Introducing a New Version

When a breaking change is unavoidable:

1. Create a new controller file: `<module>.controller.v2.ts`
2. Create new DTOs in a versioned subfolder: `dto/v2/create-<entity>.dto.ts`
3. Register the new controller alongside the old one in the module
4. Mark the old version's routes with `@ApiOperation({ deprecated: true })`
5. Keep the old version running for **one full sprint** before removal

```ts
// agents.controller.v2.ts
@ApiTags('Agents')
@Controller({ path: 'agents', version: '2' })
export class AgentsV2Controller { ... }

// agents.module.ts
controllers: [AgentsController, AgentsV2Controller]
```

## 5. Deprecation Notices

When a route is deprecated:

```ts
@ApiOperation({
  summary: 'Get all agents (deprecated — use /v2/agents instead)',
  deprecated: true,
})
@Get()
findAll() { ... }
```

Deprecated routes must still function correctly. Returning `410 Gone` is only permitted after the removal sprint has passed and clients have been notified.

## 6. Frontend Migration Protocol

Before removing an old API version:

1. The frontend team updates `src/lib/api.ts` base URL from `/v1/` to `/v2/` for the affected endpoints.
2. Both versions are deployed simultaneously for one sprint.
3. Old version is removed only after the frontend confirms it no longer calls the deprecated routes.

```ts
// src/lib/api.ts
// Migration: update per-endpoint, not globally, to avoid accidental breakage
export function apiAgents() {
  return request<Agent[]>('/v2/agents'); // updated from /v1/agents
}
```

## 7. Jira Tracking for Breaking Changes

Every breaking change that requires a new version must have a Jira ticket:
- Label: `api-versioning`
- Type: Task
- Description must include: affected endpoints, what changed, and the migration guide for frontend consumers.

## 8. Version Sunset Policy

| Phase | Duration | Action |
|---|---|---|
| Stable | Until breaking change needed | Current version in active use |
| Deprecated | 1 sprint | Old version marked deprecated in Swagger, new version deployed |
| Sunset | After 1 sprint | Old version removed from codebase and routing |

No version may be removed without completing the full deprecation sprint first.
