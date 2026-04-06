# Environment Configuration Rules

All environment-specific configuration in NexusAI Hub must be managed through environment variables. No secrets or sensitive values may appear in source code or be exposed to the browser.

## 1. No Hardcoded Values in Source Code

API base URLs, keys, and configuration values must come from environment variables — never hardcoded strings:

```ts
// Wrong
const API_URL = 'http://localhost:3001';

// Correct
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

## 2. Required Environment Variables

```env
# Public (safe for browser — Next.js bundles these into client JS)
NEXT_PUBLIC_API_URL=http://localhost:3001    # required — backend base URL

# Never add secrets as NEXT_PUBLIC_ — they will be exposed in the browser bundle
```

## 3. NEXT_PUBLIC_ Restriction

`NEXT_PUBLIC_` variables are bundled into the client-side JavaScript and visible to anyone. Only non-sensitive configuration may use this prefix:

| Allowed as NEXT_PUBLIC_ | Forbidden as NEXT_PUBLIC_ |
|---|---|
| Backend API base URL | API keys for AI providers |
| Feature flags | Session secrets |
| Analytics domain (not key) | Auth tokens |

Any AI provider API key must be called from a Next.js Server Action or API Route — never from a client component.

## 4. .env File Management

| File | Purpose | Git Status |
|---|---|---|
| `.env.example` | Template with all keys, no real values | Committed |
| `.env.local` | Local development overrides | Git-ignored |
| `.env.production` | Production values | Git-ignored — use CI/CD secrets |

Keep `.env.example` up to date every time a new variable is added. Developers must be able to `cp .env.example .env.local` and fill in their values.

## 5. Accessing Variables in Next.js

Server-only variables (no `NEXT_PUBLIC_` prefix) are accessible only in Server Components, Server Actions, and API Routes — not in Client Components:

```ts
// Safe in Server Component or API Route
const apiKey = process.env.AI_PROVIDER_API_KEY;

// Unsafe — will be undefined in Client Components
// and would expose the key if it were NEXT_PUBLIC_
```

## 6. Startup Validation

If a required variable is missing, the app should fail loudly at startup rather than silently returning `undefined` at runtime. Add a validation check in a server bootstrap file or in the root layout server component:

```ts
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}
```

## 7. localStorage — No Sensitive Data

`localStorage` may only hold:
- The session user object (name, email, plan — no password or token).
- UI configuration (active tab, theme preference).

Never cache AI API keys, JWT secrets, or full session tokens in `localStorage`.
