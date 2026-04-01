---
description: Comprehensive security implementation guidelines specific to Nexus AI Hub.
---

# Security Rules

Any code committed to Nexus AI Hub must prioritize data security, AI prompt sanitation, and environment variable protection.

## 1. Secrets Management
- **Never Hardcode Secrets:** API endpoints, model provider keys, or analytics tokens must be environment variables.
- Keep `NEXT_PUBLIC_` variables limited *strictly* to configurations that must load in the browser (e.g., base URLs). Tokens and API keys belonging to the AI model itself MUST remain hidden within Server Components or Server Actions.

## 2. Authentication & Authorization
- **Auth Guarding:** Even if a Next.js `middleware.ts` handles generic app protection, Server Actions querying user data must verify standard session integrity (`const session = await getSession(); if (!session) throw new Error("Unauthorized");`) prior to attempting mutations.
- **Role-Based Access Control (RBAC):** Ensure that sensitive administrative tasks or AI agent configurations check the user's role and authorization scopes within the `authSlice` on the client, and validated securely on the server.

## 3. Data Escaping (XSS Prevention)
- React automatically escapes string variables placed inside braces `{content}`, making base XSS injection difficult.
- **`dangerouslySetInnerHTML`:** This pattern is strictly forbidden unless absolutely required for rendering Markdown via a trusted Markdown-Parsing engine, and even then, only if fully sanitized via `DOMPurify` before injecting.

## 4. Prompt Sanitization & Injection
- **Generative AI Risks:** Any text block originating from a user (e.g. Chat Hub inputs) must not be passed to the backend unvalidated. 
- Use strict schemas (`Zod`) in server boundaries before injecting user queries into system prompts to mitigate prompt-injection attacks.

## 5. Storage
- **Browser State:** `localStorage` should only hold the JWT ID or configuration. Never cache full AI API keys on the browser instance.
- **Cookie Security:** Auth tokens set from the backend should use `HttpOnly`, `Secure`, and `SameSite=LAX` directives.
