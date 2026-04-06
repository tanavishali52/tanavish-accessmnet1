---
description: Implements NestJS session guards and auth protection in NexusAI backend. Use when tasks involve protecting a route, writing the AuthGuard, applying RBAC, or auditing unprotected endpoints.
---

# NestJS Guards & Auth Skill

## Use This Skill When

- A new controller route needs session auth protection.
- Writing or updating the `AuthGuard`.
- Adding plan-based access control (`free`, `pro`, `enterprise`).
- Auditing controllers for unprotected endpoints.

## Core Session Auth Guard

```ts
// src/common/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.session?.user) throw new UnauthorizedException('Authentication required');
    return true;
  }
}
```

## Applying the Guard

```ts
// Whole controller
@UseGuards(AuthGuard)
@Controller('agents')
export class AgentsController { ... }

// Single route only
@UseGuards(AuthGuard)
@Post()
create(@Req() req: Request, @Body() dto: CreateAgentDto) {
  const userId = req.session.user.id;
  return this.agentsService.create(userId, dto);
}
```

## Ownership Enforcement (Service Layer)

Always scope queries to `userId` from the session — never trust a body/param `userId`:

```ts
async findOne(id: string, userId: string): Promise<Agent> {
  const agent = await this.agentModel.findOne({ _id: id, userId, isDeleted: false });
  if (!agent) throw new NotFoundException('Agent not found');
  return agent;
}
```

## Plan-Based RBAC Guard

```ts
// src/common/guards/plan.guard.ts
export const RequirePlan = (...plans: string[]) => SetMetadata('requiredPlan', plans);

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('requiredPlan', context.getHandler());
    if (!required) return true;
    const user = context.switchToHttp().getRequest().session?.user;
    if (!user) throw new UnauthorizedException();
    if (!required.includes(user.plan))
      throw new ForbiddenException(`Requires ${required.join(' or ')} plan`);
    return true;
  }
}

// Usage
@RequirePlan('pro', 'enterprise')
@UseGuards(AuthGuard, PlanGuard)
@Post('advanced-run')
advancedRun() { ... }
```

## TypeScript Session Type Extension

```ts
// src/types/express-session.d.ts
import 'express-session';
declare module 'express-session' {
  interface SessionData {
    user: { id: string; name: string; email: string; plan: 'free' | 'pro' | 'enterprise' };
  }
}
```

## Publicly Accessible Routes (No Guard)

These must NOT have `AuthGuard`:
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/guest`, `GET /auth/session`
- `GET /catalog/*`
- `POST /chat/message` (guests allowed)

## Verification Checklist

- [ ] `@UseGuards(AuthGuard)` on all `AgentsController` and user-scoped `ChatController` routes.
- [ ] Service methods scope all queries to `userId` from session — never from request body.
- [ ] `PlanGuard` + `@RequirePlan()` on any gated feature.
- [ ] `express-session.d.ts` type declaration present and up to date.
- [ ] Public routes confirmed unguarded.
