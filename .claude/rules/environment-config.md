# Environment Configuration Rules

All environment-specific configuration in NexusAI must be managed through environment variables. Hardcoded values, fallback secrets, and browser-exposed tokens are forbidden.

## 1. No Hardcoded Secrets — Ever

API keys, session secrets, database URIs, and tokens must never appear in source code. There must be no hardcoded fallback for security-sensitive values:

```ts
// Forbidden
secret: process.env.SESSION_SECRET || 'change-this-secret'

// Required — fail loudly if missing
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable must be set before starting the server');
}
```

The application must refuse to start if any required secret is missing. Failing silently with a weak default is a security vulnerability.

## 2. Required Backend Environment Variables

Every deployment environment (dev, staging, production) must provide all of these:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nexus-ai        # required
MONGODB_ATLAS_URI=mongodb+srv://...                   # required in production

# Session
SESSION_SECRET=<random-64-char-string>                # required, never a fallback

# Server
NODE_ENV=development | production                     # required
PORT=3001                                             # optional, default 3001
CORS_ORIGIN=http://localhost:3000                     # required

# File Storage (when migrating to cloud)
S3_BUCKET=nexus-ai-uploads                           # required if using S3
S3_REGION=us-east-1                                  # required if using S3
CDN_BASE_URL=https://cdn.nexus-ai.com                # required if using CDN
```

## 3. Required Frontend Environment Variables

```env
# Public (safe for browser)
NEXT_PUBLIC_API_URL=http://localhost:3001             # required — backend base URL

# Never expose these as NEXT_PUBLIC_
# NEXT_PUBLIC_ANTHROPIC_API_KEY  ← FORBIDDEN
# NEXT_PUBLIC_SESSION_SECRET     ← FORBIDDEN
```

`NEXT_PUBLIC_` variables are bundled into the browser JavaScript. Never prefix a secret or API key with `NEXT_PUBLIC_`. Only base URLs and non-sensitive configuration may be browser-exposed.

## 4. NEXT_PUBLIC_ Restriction

The only `NEXT_PUBLIC_` variable allowed is `NEXT_PUBLIC_API_URL`. Any future browser-side configuration must be reviewed for sensitivity before adding the `NEXT_PUBLIC_` prefix.

If AI provider API keys are ever integrated into the frontend (they should not be), they must be proxied through a Next.js Server Action or API Route — never passed to the browser.

## 5. .env File Management

| File | Purpose | Git Status |
|---|---|---|
| `.env.example` | Template with all keys, no real values | Committed |
| `.env` | Local development values | Git-ignored |
| `.env.local` | Next.js local override | Git-ignored |
| `.env.production` | Production values | Git-ignored — use CI/CD secrets |

Always keep `.env.example` up to date when adding a new variable. Every developer must be able to `cp .env.example .env` and fill in their values.

## 6. Startup Validation

Add a startup validation function in `main.ts` (backend) that checks all required variables before the app starts:

```ts
function validateEnvironment(): void {
  const required = ['MONGODB_URI', 'SESSION_SECRET', 'NODE_ENV', 'CORS_ORIGIN'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call before NestFactory.create()
validateEnvironment();
```

## 7. Accessing Variables in NestJS

Use NestJS `ConfigModule` for typed config access — never call `process.env` directly in services:

```ts
// app.module.ts
import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot({ isGlobal: true })

// In a service
import { ConfigService } from '@nestjs/config';
constructor(private config: ConfigService) {}
const dbUri = this.config.get<string>('MONGODB_URI');
```

## 8. Cookie Security in Production

Session cookies must be configured based on `NODE_ENV`:

```ts
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax',
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
}
```

Never set `secure: true` in development (HTTPS not available locally). Never set `secure: false` in production.
