# Error Handling Rules

All error handling in the NexusAI NestJS backend must use the global interceptor/filter system. No raw errors may reach the client.

## 1. Global Response Contract

All responses are wrapped by the global `ResponseInterceptor`:

```json
// Success
{ "success": true, "message": "Success", "data": <T> }

// Error (via HttpExceptionFilter)
{ "success": false, "message": "Reason", "errors": [] }
```

Never manually wrap responses in controllers — the interceptor handles it.

## 2. Throw NestJS HTTP Exceptions

Always throw the appropriate NestJS HTTP exception — never `throw new Error(...)`:

```ts
throw new NotFoundException('Agent not found');
throw new UnauthorizedException('Authentication required');
throw new ForbiddenException('Access denied');
throw new ConflictException('Email already registered');
throw new BadRequestException('Invalid file type');
throw new InternalServerErrorException('Failed to process request');
```

## 3. Map Mongoose Errors Explicitly

Mongoose/MongoDB errors must be caught and mapped before they bubble up:

```ts
import { MongoServerError } from 'mongodb';

try {
  return await this.userModel.create(dto);
} catch (err) {
  if (err instanceof MongoServerError && err.code === 11000)
    throw new ConflictException('Email address is already registered');
  throw new InternalServerErrorException('Failed to create user');
}
```

Never let a raw `MongoServerError` or Mongoose `ValidationError` reach the global filter.

## 4. Not Found Handling

When a document is not found, throw `NotFoundException` with a descriptive message — never return `null` or an empty object:

```ts
const agent = await this.agentModel.findOne({ _id: id, userId });
if (!agent) throw new NotFoundException(`Agent '${id}' not found`);
return agent;
```

## 5. Validation Errors

The global `ValidationPipe` automatically throws `BadRequestException` with field-level detail when DTO validation fails. Do not add additional manual validation that duplicates this — only add Zod for AI/chat message boundaries where `class-validator` is insufficient.

## 6. No Silent Failures

Never swallow errors with an empty `catch` block. If an error occurs and the service cannot recover, it must either:
- Re-throw as an appropriate `HttpException`, or
- Log the error and throw `InternalServerErrorException`

```ts
// Wrong
try { ... } catch { /* silent */ }

// Correct
try { ... } catch (err) {
  console.error('[AgentsService.run]', err);
  throw new InternalServerErrorException('Agent run failed');
}
```

## 7. 404 for Missing Resources via URL Params

If a user accesses a resource that does not exist (agent ID, session ID), respond with 404 — never 500. Always check existence before processing:

```ts
@Get(':id')
async findOne(@Param('id') id: string, @Req() req: Request) {
  const agent = await this.agentsService.findOne(id, req.session.user.id);
  // findOne already throws NotFoundException if not found
  return agent;
}
```
