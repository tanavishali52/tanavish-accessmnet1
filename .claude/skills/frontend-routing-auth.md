---
description: Implements and validates frontend routing and auth flow in NexusAI Hub. Use when tasks involve Next.js pages, URL navigation, login/signup redirects, session hydration, guarded navigation, or preserving next-return behavior.
---

# Frontend Routing and Auth

## Use This Skill When

- Adding or changing routes under `src/app`.
- Fixing broken navigation behavior (URL and UI state mismatch).
- Implementing login/signup redirect behavior.
- Handling `next` query param and safe redirect rules.

## Project Rules

- Use URL-based routing first (`router.push`, page routes).
- Keep pages shareable: `/chat`, `/marketplace`, `/agents`, `/research`.
- Auth pages: `/login`, `/signup`.
- Preserve `next` destination after auth, but only allow app-relative values.
- Auth session source of truth:
  - Redux `authSlice`
  - persisted `localStorage` key: `nexusai:user`
  - hydration in `src/providers/StoreProvider.tsx`

## Implementation Steps

1. Identify where navigation starts (buttons/links/nav items).
2. Replace state-only navigation with route navigation when needed.
3. Ensure routed pages render the correct workspace/tab state.
4. For auth pages:
   - Redirect authenticated users away from `/login` and `/signup`.
   - Parse and sanitize `next`.
5. Validate no route loop and no invalid external redirect.
6. Run `npm run lint`.

## Safe Redirect Helper Pattern

Use this logic for `next`:

```ts
function safeNext(next: string | null) {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//')) return '/';
  return next;
}
```

## Done Checklist

- [ ] Route path updates browser URL correctly.
- [ ] Back/forward works as expected.
- [ ] Login/signup redirect flow works for guest and authenticated user.
- [ ] `npm run lint` passes.
