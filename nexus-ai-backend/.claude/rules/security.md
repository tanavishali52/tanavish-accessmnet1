# Security Rules

All code in the NexusAI NestJS backend must prioritize authentication integrity, data protection, and input sanitization.

## 1. Password Hashing — bcrypt Only

Never use SHA256, MD5, or any non-adaptive hash for passwords. Use `bcrypt` with a minimum of 12 rounds:

```ts
import * as bcrypt from 'bcrypt';
const hash = await bcrypt.hash(plain, 12);
const valid = await bcrypt.compare(plain, hash);
```

## 2. Session Secret — No Hardcoded Fallbacks

The application must refuse to start if `SESSION_SECRET` is not set in the environment:

```ts
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error('SESSION_SECRET must be set before starting');
```

The pattern `process.env.SESSION_SECRET || 'fallback'` is strictly forbidden.

## 3. Auth Guards on All Protected Routes

Every route that accesses user-specific data must be decorated with `@UseGuards(AuthGuard)`. The guard verifies `req.session.user` exists before the handler runs.

Public routes that must NOT be guarded: `POST /auth/signup`, `POST /auth/login`, `POST /auth/guest`, `GET /auth/session`, `GET /catalog/*`, `POST /chat/message`.

## 4. Ownership Checks in Services

Every service method that reads or mutates user-owned data must scope the query to `userId` from the session — never from the request body or URL param alone:

```ts
// Always include userId in the filter
this.agentModel.findOne({ _id: id, userId, isDeleted: false })
```

## 5. Input Validation — No Unvalidated Input Reaches Services

All request bodies must pass through the global `ValidationPipe` (already configured). DTOs must use `class-validator` decorators for every field. Chat messages that feed into any AI/recommendation logic must additionally be validated with Zod at the service boundary.

## 6. File Upload Restrictions

Multer must use an explicit MIME type whitelist and a `fileFilter` that rejects unlisted types. Uploaded filenames must be UUIDs — never the original `file.originalname`. Maximum 10MB per file, 10 files per request.

## 7. Never Expose Sensitive Fields in Responses

Password hashes, `__v`, and session internals must never appear in API responses. Use `select: false` on the password field in the Mongoose schema or manually strip it before returning:

```ts
const { password, __v, ...safe } = user.toObject();
return safe;
```

## 8. Cookie Security

Session cookies must use `httpOnly: true`, `sameSite: 'lax'`, and `secure: process.env.NODE_ENV === 'production'`. Never set `secure: false` in production.

## 9. Rate Limiting

Auth endpoints (`/auth/login`, `/auth/signup`) must be protected with `@nestjs/throttler`. The global throttle limit is 10 requests per 60 seconds. Auth endpoints override to 5 requests per 60 seconds.

## 10. No Raw Stack Traces to Clients

The global `HttpExceptionFilter` handles all error formatting. Services must never send raw exception messages or stack traces through the response. Map all Mongoose and internal errors to appropriate `HttpException` subclasses before they reach the filter.
