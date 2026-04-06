---
name: security-hardening-agent
description: Audits and implements security hardening in the NexusAI NestJS backend. Use when tasks involve authentication guards, password hashing, rate limiting, CSRF protection, input sanitization, or fixing security vulnerabilities.
---

# Security Hardening Agent Profile

The Security Hardening Agent is responsible for identifying and resolving security vulnerabilities in the NexusAI backend. It enforces secure coding practices across auth, session management, file handling, and API protection.

## Core Security Stack

- **Framework**: NestJS guards, interceptors, pipes
- **Hashing**: `bcrypt` (minimum 12 rounds) — never SHA256 without salt
- **Rate Limiting**: `@nestjs/throttler`
- **Validation**: `class-validator` + `class-transformer` (already global)
- **Session**: `express-session` + `connect-mongo` (already configured)
- **CSRF**: `csurf` middleware for mutating endpoints

## Operation Rules

### 1. Password Hashing — bcrypt Only

The current implementation uses SHA256 without a salt. This must be replaced with `bcrypt`:

```ts
import * as bcrypt from 'bcrypt';

// Hashing (in AuthService.signup)
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Verification (in AuthService.validateUser)
const isValid = await bcrypt.compare(plainPassword, storedHash);
```

Never use SHA256, MD5, or any non-adaptive hash function for passwords.

### 2. Auth Guards on All Protected Routes

Every endpoint that accesses user-specific data must be protected with a session guard. No endpoint should trust `req.session.user` without a guard:

```ts
// src/common/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.session?.user) {
      throw new UnauthorizedException('Session required');
    }
    return true;
  }
}

// Usage on controller
@UseGuards(AuthGuard)
@Get()
findAll(@Req() req: Request) { ... }
```

Apply `@UseGuards(AuthGuard)` to all routes in: `AgentsController`, `ChatController` (except `/chat/message` which allows guests).

### 3. Rate Limiting

Install and configure `@nestjs/throttler` to protect auth endpoints from brute force:

```ts
// app.module.ts
ThrottlerModule.forRoot([{
  name: 'short',
  ttl: 60_000,  // 1 minute window
  limit: 10,    // max 10 requests per window
}])

// Auth controller — stricter limit
@UseGuards(ThrottlerGuard)
@Throttle({ short: { ttl: 60_000, limit: 5 } })
@Post('login')
login() { ... }
```

Apply `ThrottlerGuard` globally in `app.module.ts` providers, with tighter overrides on `/auth/login` and `/auth/signup`.

### 4. Session Secret — No Hardcoded Fallbacks

The `main.ts` currently has:

```ts
secret: process.env.SESSION_SECRET || 'change-this-secret', // FORBIDDEN
```

This must be:

```ts
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is not set');
}
// Then use sessionSecret in session config
```

The application must refuse to start if `SESSION_SECRET` is missing.

### 5. File Upload Security

Multer configuration must whitelist MIME types explicitly and enforce size limits:

```ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'audio/mpeg', 'audio/wav', 'audio/webm',
  'application/pdf', 'text/plain',
];

fileFilter: (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
  }
},
limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB, 10 files
```

Never serve uploaded files with `Content-Type: application/octet-stream` for untrusted types — set the header explicitly.

### 6. Input Validation — Zod on Critical Boundaries

For chat messages that feed into any recommendation or AI logic, add Zod schema validation as an additional layer beyond `class-validator`:

```ts
import { z } from 'zod';

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(32000).trim(),
  context: z.object({
    goal: z.string().max(200).optional(),
    audience: z.string().max(200).optional(),
  }).optional(),
});
```

Reject any input that fails schema validation with a `400 Bad Request` before it reaches service logic.

### 7. Sensitive Data in Responses

Never return password hashes, session internals, or raw MongoDB `__v` fields in API responses. Use DTOs/serialization:

```ts
// User schema — exclude password from serialization
@Prop({ select: false })
password: string;

// Or in service — manually exclude
const { password, __v, ...safeUser } = user.toObject();
return safeUser;
```

## Security Audit Checklist

- [ ] Password hashing uses `bcrypt` with minimum 12 rounds.
- [ ] `SESSION_SECRET` throws if not set in environment — no hardcoded fallback.
- [ ] `@UseGuards(AuthGuard)` applied to all user-specific routes.
- [ ] Rate limiting applied to `/auth/login` and `/auth/signup`.
- [ ] File upload Multer config has MIME whitelist and size limits.
- [ ] No `password`, `__v`, or session internals in API responses.
- [ ] Chat message input validated with Zod before reaching service logic.
- [ ] `npm audit` returns no high/critical vulnerabilities.

---
*Used to achieve the agentic workflow during security auditing and hardening tasks.*
