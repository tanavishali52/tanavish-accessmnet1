---
name: backend-api-contracts
description: Implements and validates NestJS API contracts for NexusAI backend. Use when tasks involve controllers, DTOs, response shapes, Swagger docs, or preserving frontend-compatible JSON payloads.
---

# Backend API Contracts

## Use This Skill When

- Adding or changing endpoints in `src/catalog`, `src/chat-hub`, or `src/auth`.
- Modifying request/response payload shapes.
- Updating Swagger docs or route metadata.
- Keeping frontend and backend JSON contracts aligned.

## Project Rules

- Keep API prefix as `/api`.
- Return JSON only.
- Keep existing response keys stable unless frontend is updated too.
- Use DTO classes with `class-validator` for request bodies.
- Add Swagger decorators on new/updated routes.

## Implementation Steps

1. Identify contract source (frontend usage and existing endpoint shape).
2. Update DTOs/types first, then service logic, then controller outputs.
3. Preserve backward-compatible fields where possible.
4. Add or update Swagger annotations.
5. Validate build: `npm run build`.

## Done Checklist

- [ ] Endpoint path and method are correct.
- [ ] Response shape matches frontend expectations.
- [ ] Swagger reflects updated contract.
- [ ] `npm run build` passes.
