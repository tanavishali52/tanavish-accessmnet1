# API Versioning Rules

All NexusAI backend API changes must follow this versioning policy to prevent breaking existing frontend clients.

## 1. URI Path Versioning

Versioning is configured in `main.ts` with `defaultVersion: '1'`. All existing routes are automatically served under `/v1/`.

## 2. Controllers Must Declare Their Version

```ts
@Controller({ path: 'agents', version: '1' })
export class AgentsController { ... }
```

## 3. Breaking vs Non-Breaking Changes

**Breaking (requires a new version):** removing or renaming a response field, changing a field type, removing an endpoint, changing an HTTP method, making an optional field required.

**Non-breaking (allowed in the current version):** adding new optional response fields, adding new optional query params, adding new endpoints, bug fixes, improved error messages.

## 4. Introducing a New Version

1. Create `<module>.controller.v2.ts` alongside the existing controller.
2. Create DTOs in `dto/v2/`.
3. Register the new controller in the module alongside the old one.
4. Mark old routes with `@ApiOperation({ deprecated: true })`.
5. Keep the old version running for one full sprint before removal.

## 5. Deprecation in Swagger

```ts
@ApiOperation({ summary: 'Get agents (deprecated — use /v2/agents)', deprecated: true })
```

## 6. Frontend Migration Coordination

Before removing an old version: confirm the frontend `src/lib/api.ts` has been updated to call the new version path. Both versions must run simultaneously for one sprint after the new version deploys.

## 7. Version Sunset Policy

Deprecated → functional for 1 sprint → removed. No version is removed without completing the full deprecation sprint. Every breaking change must have a NEXUS Jira ticket labeled `api-versioning`.
