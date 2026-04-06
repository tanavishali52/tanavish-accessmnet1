# Nexus AI — Backend (NestJS)

> The NestJS API server powering the Nexus AI platform. Handles authentication, agent management, catalog browsing, and real-time chat via WebSockets.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (modular architecture) |
| Database | MongoDB via Mongoose ODM |
| Validation | `class-validator` + `class-transformer` |
| Documentation | Swagger / OpenAPI (`/api/docs`) |
| Session | `express-session` + `connect-mongo` |
| Language | TypeScript (strict mode) |

## Module Overview

```
src/
├── agents/        # Agent CRUD — creation, config, retrieval
├── auth/          # Registration, login, logout, session guards
├── catalog/       # Catalog & marketplace item management
├── chat/          # Chat message history
├── chat-hub/      # WebSocket gateway for real-time chat
├── common/        # Global ResponseInterceptor & HttpExceptionFilter
├── data/          # Static seed data
├── app.module.ts  # Root module wiring
└── main.ts        # Bootstrap & Swagger setup
```

## API Response Contract

All endpoints return a standardized envelope via the global `ResponseInterceptor`:

```json
// Success
{ "success": true, "message": "Success", "data": <T> }

// Error (via HttpExceptionFilter)
{ "success": false, "message": "Reason for error", "errors": [] }
```

Never wrap responses manually inside controllers — the interceptor handles it.

## Main Endpoints

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and create session |
| POST | `/auth/logout` | Destroy session |

### Agents
| Method | Path | Description |
|---|---|---|
| GET | `/agents` | List all agents |
| POST | `/agents` | Create a new agent |
| GET | `/agents/:id` | Get agent details |
| PUT | `/agents/:id` | Update agent |
| DELETE | `/agents/:id` | Delete agent |

### Catalog
| Method | Path | Description |
|---|---|---|
| GET | `/catalog` | List catalog items |
| GET | `/catalog/:id` | Get catalog item details |

### Chat
| Method | Path | Description |
|---|---|---|
| GET | `/chat` | Get chat history |
| POST | `/chat` | Send a chat message |
| WebSocket | `/chat-hub` | Real-time chat connection |

Full interactive docs at `http://localhost:3001/api/docs` after starting the server.

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB instance (local or Atlas)

### Setup

```bash
npm install
```

Create a `.env` file in this directory:

```env
MONGODB_URI=mongodb://localhost:27017/nexus-ai
MONGODB_ATLAS_URI=your_mongodb_atlas_uri
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
PORT=3001
```

### Running

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build && npm run start:prod
```

Server starts at `http://localhost:3001`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the application |
| `npm run start:dev` | Start with file-watch mode |
| `npm run start:debug` | Start with debugger attached |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |

## Security Guidelines

- All Server Actions and protected routes must verify session integrity before executing mutations.
- Never expose raw stack traces to clients — use the global `HttpExceptionFilter`.
- Environment secrets (`SESSION_SECRET`, DB URIs) must never be hardcoded.
- Auth cookies use `HttpOnly`, `Secure`, and `SameSite=LAX` directives.

See `.claude/rules/security.md` (root) for the full security ruleset.

## Jira Tracking

Backend issues are tracked under the `NEXUS` Jira project. All branches must follow the convention `<type>/NEXUS-<number>-short-description`. See `.claude/agents/jira-agent.md` (root) for the full Jira workflow.
