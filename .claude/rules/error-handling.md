---
description: Unified error handling methodology for Next.js, React UI boundaries, and API integrations in Nexus AI Hub.
---

# Error Handling Rules

Error handling must be robust, separating UI/UX considerations from Server telemetry securely.

## 1. Next.js Server Actions & API Routes
- **Never expose raw stack traces to the client.** If a Server Action fails, catch it and return a normalized object:
  ```ts
  return { success: false, error: 'Failed to process AI model request.' };
  ```
- **Routing Errors:** If a user tries to access a model ID or conversation that does not exist, use Next.js `notFound()` inside the server component layout/page. Do not just throw a 500 error.

## 2. Network Client-Side Handling (Fetching)
- Always assume network inputs can fail or timeout. 
- Use standard `try/catch` and check `!response.ok` before attempting to parse `.json()`. 

## 3. Redux Application State
- Slices fetching dynamic data (like `chatSlice` or `modelsSlice`) must track loading behavior safely.
- Maintain `{ status: 'idle' | 'loading' | 'failed', error: string | null }` pattern in state. When a mutation fails:
  1. Set status to `failed`.
  2. Populate `error` with a human-readable string.
  3. UI layers reading the store should automatically surface an alert/toast based on this error state.

## 4. React Error Boundaries
- Implement global `<ErrorBoundary>` wrappers (or Next.js `error.tsx`) in critical view boundaries (like `/chat`) so a single bad localized render doesn't crash the entire dashboard UI route.
- Include a fallback action allowing the user to `try again` (reset boundary).

## 5. Fallback Defaulting
- If a value might realistically be undefined, default it structurally to prevent `Cannot read properties of undefined` runtime closures. 
  - `const title = data?.title ?? "Untitled Chat";`
