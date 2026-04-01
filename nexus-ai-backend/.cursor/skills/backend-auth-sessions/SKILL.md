---
name: backend-auth-sessions
description: Implements and maintains Mongo-backed session auth in NexusAI backend. Use when tasks involve login/signup/guest/session/logout flows, session cookies, Mongo session store, or auth user schema behavior.
---

# Backend Auth and Sessions

## Use This Skill When

- Editing `src/auth/*` or auth-related DTO/schema files.
- Changing session logic in `src/main.ts`.
- Adjusting guest mode / logged user behavior.
- Investigating auth persistence issues.

## Current Auth Contracts

- Session user is stored at `session.user`.
- Guest mode user must include `guestMode: true`.
- Logged user must include `guestMode: false`.
- Session endpoints:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/guest`
  - `GET /api/auth/session`
  - `POST /api/auth/logout`

## Session Rules

- Session store must remain MongoDB-backed (`connect-mongo`).
- Use `MONGO_URI` (fallback `MONGODB_URI`) for store/database.
- Keep cookie `httpOnly: true`.
- Keep `secure` conditional on production.

## Implementation Workflow

1. Update auth DTO/schema/service contract first.
2. Update controller responses while preserving session shape.
3. Verify session create/read/destroy behavior.
4. Validate build: `npm run build`.
5. Confirm Swagger endpoint coverage for auth routes.

## Done Checklist

- [ ] Guest session creation works.
- [ ] Login/signup create logged user session.
- [ ] Session read returns expected `authenticated` + `user`.
- [ ] Logout destroys session.
- [ ] `npm run build` passes.
