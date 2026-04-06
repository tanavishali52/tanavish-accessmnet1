---
description: Implements NestJS guards and session-based auth protection in the NexusAI backend. Use when tasks involve protecting a route, writing a new guard, applying role-based access, or auditing unprotected endpoints.
---

# NestJS Guards & Auth Skill

## Use This Skill When

- A new controller route needs to be protected behind session auth.
- Writing or updating the `AuthGuard` used across the API.
- Adding role-based access control (RBAC) for plan-gated features.
- Auditing existing controllers for unprotected endpoints.

## Core Session Auth Guard

Create this guard once and reuse it across all protected controllers:

```ts
// src/common/guards/auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.session?.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return true;
  }
}
```

## Applying the Guard

### On a whole controller (protects all routes)

```ts
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('agents')
export class AgentsController { ... }
```

### On a single route (mixed public/protected controller)

```ts
@UseGuards(AuthGuard)
@Post()
create(@Req() req: Request, @Body() dto: CreateAgentDto) {
  const userId = req.session.user.id;
  return this.agentsService.create(userId, dto);
}
```

## Ownership Guard (User-Scoped Resources)

Agents and chat sessions belong to a user. Verify ownership in the service, not just the guard:

```ts
// In AgentsService
async findOne(id: string, userId: string): Promise<Agent> {
  const agent = await this.agentModel.findOne({ _id: id, userId, isDeleted: false });
  if (!agent) {
    throw new NotFoundException('Agent not found');
  }
  return agent;
}
```

Never rely solely on the route param — always scope queries to `userId` from the session.

## Plan-Based RBAC Guard

For features gated by `free`, `pro`, or `enterprise` plan:

```ts
// src/common/guards/plan.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const REQUIRED_PLAN = 'requiredPlan';
export const RequirePlan = (...plans: string[]) => SetMetadata(REQUIRED_PLAN, plans);

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.get<string[]>(REQUIRED_PLAN, context.getHandler());
    if (!requiredPlans) return true; // no plan requirement

    const request = context.switchToHttp().getRequest();
    const user = request.session?.user;
    if (!user) throw new UnauthorizedException('Authentication required');
    if (!requiredPlans.includes(user.plan)) {
      throw new ForbiddenException(`This feature requires a ${requiredPlans.join(' or ')} plan`);
    }
    return true;
  }
}

// Usage on a route
@RequirePlan('pro', 'enterprise')
@UseGuards(AuthGuard, PlanGuard)
@Post('advanced-run')
advancedRun() { ... }
```

## Accessing Session User in Controllers

Always extract the user from the session inside the controller method — never trust a body parameter for `userId`:

```ts
import { Req } from '@nestjs/common';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Get()
findAll(@Req() req: Request) {
  const userId = req.session.user.id;
  return this.agentsService.findAll(userId);
}
```

## Extending Express Session Type

Ensure TypeScript knows about `session.user` by extending the session interface:

```ts
// src/types/express-session.d.ts
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      name: string;
      email: string;
      plan: 'free' | 'pro' | 'enterprise';
    };
  }
}
```

## Routes That Must NOT Be Protected

These routes are intentionally public — do not add `AuthGuard`:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/guest`
- `GET /auth/session`
- `GET /catalog/*` (public catalog browsing)
- `POST /chat/message` (guests can use chat)

## Verification Checklist

- [ ] `AuthGuard` applied to all `AgentsController` and user-specific `ChatController` routes.
- [ ] Service methods scope all queries to `userId` from the session — never from the request body.
- [ ] `PlanGuard` + `@RequirePlan()` applied to any pro/enterprise-only feature.
- [ ] `express-session.d.ts` type declaration is present and up to date.
- [ ] Public routes (`/auth/*`, `/catalog/*`) do not have `AuthGuard` applied.
