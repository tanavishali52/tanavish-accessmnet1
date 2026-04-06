# Nexus AI - AI Agent Management Platform

> A comprehensive full-stack platform for managing, deploying, and interacting with AI agents. Built with modern technologies including NestJS, Next.js, MongoDB, and Redux.

## 📋 Overview

Nexus AI is a sophisticated platform that enables users to create, manage, and interact with AI agents through an intuitive interface. The platform provides agent marketplace, real-time chat capabilities, research tools, and a comprehensive agent builder for creating custom AI agents.

### Key Features

- **🤖 Agent Management**: Create, configure, and manage AI agents
- **💬 Real-time Chat**: Interact with AI agents through a responsive chat interface
- **🛒 Marketplace**: Browse and discover available AI agents
- **🔍 Research Tools**: Advanced research capabilities integrated into the platform
- **🔐 Authentication**: Secure user authentication with session management
- **📊 Dashboard**: Intuitive workspace for managing your agents and interactions
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations

## 🏗️ Project Structure

```
tanavish-accessmnet1/
├── nexus-ai-backend/          # NestJS backend server
│   ├── src/
│   │   ├── agents/            # Agent management module
│   │   ├── auth/              # Authentication module
│   │   ├── catalog/           # Catalog management
│   │   ├── chat/              # Chat functionality
│   │   ├── chat-hub/          # WebSocket chat hub
│   │   ├── common/            # Shared filters & interceptors
│   │   ├── data/              # Static data
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Application entry point
│   ├── test/                  # E2E tests
│   └── package.json
│
└── nexus-ai-hub/              # Next.js frontend application
    ├── src/
    │   ├── app/               # Next.js pages & routes
    │   │   ├── agents/        # Agents page
    │   │   ├── chat/          # Chat page
    │   │   ├── login/         # Login page
    │   │   ├── marketplace/   # Marketplace page
    │   │   └── signup/        # Signup page
    │   ├── components/        # Reusable React components
    │   │   ├── app/           # App-specific components
    │   │   ├── auth/          # Authentication components
    │   │   ├── landing/       # Landing page components
    │   │   └── shared/        # Shared UI components
    │   ├── lib/               # Utility functions & API client
    │   ├── store/             # Redux store & slices
    │   └── providers/         # React providers
    └── package.json
```

## 🔧 Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Validation**: Class Validator & Class Transformer
- **Documentation**: Swagger/OpenAPI
- **Session Management**: Express Session with MongoDB store
- **Language**: TypeScript

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) - React framework
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanavishali52/tanavish-accessmnet1.git
   cd tanavish-accessmnet1
   ```

2. **Install Backend Dependencies**
   ```bash
   cd nexus-ai-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../nexus-ai-hub
   npm install
   ```

### Configuration

Create a `.env` file in the `nexus-ai-backend` directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nexus-ai
MONGODB_ATLAS_URI=your_mongodb_atlas_uri

# Session
SESSION_SECRET=your_session_secret_key

# Server
NODE_ENV=development
PORT=3001
```

### Running the Application

#### Development Mode

**Backend:**
```bash
cd nexus-ai-backend
npm run start:dev
```

The backend will start on `http://localhost:3001`

**Frontend:**
```bash
cd nexus-ai-hub
npm run dev
```

The frontend will start on `http://localhost:3000`

#### Production Mode

**Backend:**
```bash
cd nexus-ai-backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd nexus-ai-hub
npm run build
npm run start
```

## 📚 Available Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start with watch mode |
| `npm run start:debug` | Start with debugging enabled |
| `npm run start:prod` | Start production build |
| `npm run build` | Build the project |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📖 API Documentation

The backend provides Swagger/OpenAPI documentation at:
```
http://localhost:3001/api/docs
```

### Main Endpoints

- **Authentication**
  - `POST /auth/signup` - Register a new user
  - `POST /auth/login` - Login with credentials
  - `POST /auth/logout` - Logout user

- **Agents**
  - `GET /agents` - Get all agents
  - `POST /agents` - Create a new agent
  - `GET /agents/:id` - Get agent details
  - `PUT /agents/:id` - Update agent
  - `DELETE /agents/:id` - Delete agent

- **Chat**
  - `GET /chat` - Get chat history
  - `POST /chat` - Send message
  - `WebSocket /chat-hub` - Real-time chat connection

- **Catalog**
  - `GET /catalog` - Get catalog items
  - `GET /catalog/:id` - Get catalog item details

## 🏗️ Module Architecture

### Backend Modules

#### Agents Module
Manages agent creation, configuration, and retrieval. Handles agent lifecycle and metadata.

#### Auth Module
Handles user authentication, registration, and session management. Integrates with MongoDB for user storage.

#### Chat Module
Manages chat messages and conversation history between users and AI agents.

#### Chat Hub Module
WebSocket implementation for real-time chat communication.

#### Catalog Module
Manages the catalog of available agents and marketplace items.

### Frontend Store (Redux)

- **authSlice**: Authentication state (user info, login status)
- **agentSlice**: Agent management state
- **chatSlice**: Chat messages and conversation state
- **modalSlice**: Modal visibility states
- **modelsSlice**: AI models information
- **appSlice**: Global application state

## 🔐 Security Features

- Session-based authentication with MongoDB session store
- Password hashing and validation
- CORS protection
- Input validation using class-validator
- Type-safe implementations with TypeScript
- Secure cookie handling

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Modes**: Customizable theme support
- **Smooth Animations**: Framer Motion transitions
- **Component Library**: Reusable shared components
- **Toast Notifications**: User feedback system
- **Loading States**: Skeleton loaders for better UX

## 📦 Dependencies Overview

### Critical Backend Dependencies
- `@nestjs/core` & `@nestjs/common` - Core NestJS framework
- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - Database ODM
- `@nestjs/swagger` - API documentation
- `express-session` & `connect-mongo` - Session management

### Critical Frontend Dependencies
- `next` - React framework
- `react` & `react-dom` - UI library
- `@reduxjs/toolkit` & `react-redux` - State management
- `tailwindcss` - CSS framework
- `framer-motion` - Animation library

## 🧪 Testing

### Backend Tests

Run unit tests:
```bash
cd nexus-ai-backend
npm test
```

Run with coverage:
```bash
npm run test:cov
```

Run E2E tests:
```bash
npm run test:e2e
```

## 📝 Development Guidelines

### Code Style

The project uses ESLint and Prettier for code consistency. Auto-formatting is configured.

Format code:
```bash
npm run format
```

Run linting:
```bash
npm run lint
```

### Best Practices

- Use TypeScript strict mode
- Follow NestJS module structure
- Keep components small and reusable
- Use Redux for state management
- Write meaningful commit messages
- Add tests for new features

## 🤖 Agentic Workflow (.claude)

This repository uses a structured Claude Code agentic setup located in `.claude/`. The agents, rules, and skills here drive the AI-assisted development workflow.

### Agents

#### Frontend Agents

| Agent | File | Responsibility |
|---|---|---|
| Frontend Developer | `.claude/agents/frontend-developer.md` | Next.js UI/UX implementation with Tailwind & Redux |
| i18n Agent | `.claude/agents/i18n-agent.md` | Translation keys, locale files, `useTranslation()` integration, new language support |
| Animation & Motion Agent | `.claude/agents/animation-motion-agent.md` | Framer Motion transitions, entrance/exit, stagger lists, modal/sidebar patterns |
| State Debugging Agent | `.claude/agents/state-debugging-agent.md` | Redux stale state, selector performance, localStorage hydration, re-render diagnosis |
| Accessibility Agent | `.claude/agents/accessibility-agent.md` | ARIA labels, keyboard navigation, focus trapping, WCAG 2.1 AA compliance |
| QA Validation | `.claude/agents/qa-validation-agent.md` | Functional testing, UI audit, and code quality review |

#### Backend Agents

| Agent | File | Responsibility |
|---|---|---|
| Nest Backend Engineer | `.claude/agents/nest-backend.md` | NestJS API design, Mongoose schemas, and authentication |
| Security Hardening Agent | `.claude/agents/security-hardening-agent.md` | bcrypt, auth guards, rate limiting, CSRF, file upload security |
| Database & Mongoose Agent | `.claude/agents/database-mongoose-agent.md` | Schema design, indexes, query optimisation, pagination, soft delete |
| File Upload & Storage Agent | `.claude/agents/file-upload-storage-agent.md` | Multer config, MIME validation, static serving, cloud storage migration |
| API Versioning Agent | `.claude/agents/api-versioning-agent.md` | URI versioning, breaking change management, deprecation workflow |

#### Project Management Agents

| Agent | File | Responsibility |
|---|---|---|
| Jira Agent | `.claude/agents/jira-agent.md` | Ticket lifecycle, sprint tracking, PR linkage, and bug triage |

### Rules

| Rule | File | Coverage |
|---|---|---|
| Code Style | `.claude/rules/code-style.md` | File naming, imports, TypeScript, component structure, Tailwind |
| Error Handling | `.claude/rules/error-handling.md` | Server actions, Redux state, error boundaries, fallback defaults |
| Security | `.claude/rules/security.md` | Secrets, auth guards, XSS prevention, prompt sanitization |
| Testing | `.claude/rules/testing.md` | Unit tests, E2E tests, coverage thresholds, test isolation |
| Performance | `.claude/rules/performance.md` | Pagination, `.lean()`, caching, memoized selectors, bundle size |
| Accessibility | `.claude/rules/accessibility.md` | WCAG 2.1 AA, ARIA, focus management, contrast, keyboard nav |
| Environment Config | `.claude/rules/environment-config.md` | Secrets management, env var validation, `NEXT_PUBLIC_` restrictions |
| Database | `.claude/rules/database.md` | Schema conventions, indexes, soft delete, pagination, no unbounded queries |
| API Versioning | `.claude/rules/api-versioning.md` | Breaking change policy, version introduction, deprecation, sunset |

### Skills

#### Frontend Skills

| Skill | File | When to Use |
|---|---|---|
| API Integration | `.claude/skills/api-integration.md` | Adding/refactoring `src/lib/api.ts` fetch calls and Redux data flow |
| Code Review | `.claude/skills/code-review.md` | Reviewing Redux slices, component structure, and API patterns |
| Frontend Routing & Auth | `.claude/skills/frontend-routing-auth.md` | Middleware, protected routes, and session-aware navigation |
| PR Review | `.claude/skills/pr-review.md` | Final pre-submission checklist for responsiveness and code quality |
| Responsive Design | `.claude/skills/responsive-design.md` | Mobile-first layout, sidebar behaviour, and Tailwind breakpoints |
| Redux Slice Authoring | `.claude/skills/redux-slice-authoring.md` | Writing new slices, async actions, localStorage persistence, `createSelector` |
| Framer Motion Patterns | `.claude/skills/framer-motion-patterns.md` | Fade/slide, AnimatePresence, stagger lists, modals, sidebars |
| i18n Translation | `.claude/skills/i18n-translation.md` | Adding translation keys, locale files, `useTranslation()`, new languages |
| Form Validation | `.claude/skills/form-validation.md` | Field-level validation, error display, submission state, Redux wiring |
| Skeleton Loading | `.claude/skills/skeleton-loading.md` | Loading placeholders wired to Redux status, skeleton layout patterns |

#### Backend Skills

| Skill | File | When to Use |
|---|---|---|
| NestJS Guards & Auth | `.claude/skills/nestjs-guards-auth.md` | Writing/applying `AuthGuard`, ownership checks, plan-based RBAC |
| Mongoose Schema Design | `.claude/skills/mongoose-schema-design.md` | New schemas, field constraints, indexes, relationship modelling |
| DTO Validation Patterns | `.claude/skills/dto-validation-patterns.md` | `class-validator` decorators, `PartialType`, enum validation, nested DTOs |
| Swagger Documentation | `.claude/skills/swagger-documentation.md` | `@ApiTags`, `@ApiOperation`, `@ApiResponse`, deprecation notices |
| File Upload Handling | `.claude/skills/file-upload-handling.md` | Multer config, MIME filtering, static serving, cleanup on delete |

#### Jira Skills

| Skill | File | When to Use |
|---|---|---|
| Jira Issue Management | `.claude/skills/jira-issue-management.md` | Creating/updating tickets, bug reports, status transitions |
| Jira Branch & PR Linking | `.claude/skills/jira-branch-pr-linking.md` | Branch naming, commit message format, PR-to-Jira linkage |
| Jira Sprint Planning | `.claude/skills/jira-sprint-planning.md` | Sprint prep, story point estimation, and sprint summary reports |

### Jira Issue Convention

All work tracked in Jira follows the `NEXUS-<number>` key format. Branches must be named `<type>/NEXUS-<number>-short-description` and commit messages must begin with the issue key (e.g., `NEXUS-42: Add agent builder panel`). See `.claude/agents/jira-agent.md` for the full workflow.

---

## 🤝 Contributing

1. Fork the repository
2. Create a Jira ticket (or pick an existing `NEXUS-<number>` issue) and move it to **In Progress**
3. Create a feature branch following the convention: `feat/NEXUS-<number>-short-description`
4. Commit changes using the issue key: `git commit -m 'NEXUS-<number>: Add amazing feature'`
5. Push to branch and open a Pull Request — transition the Jira ticket to **In Review**
6. After merge and QA sign-off, close the ticket as **Done**

## 📄 License

This project is licensed under the UNLICENSED license.

## 👨‍💻 Author

[Tanavish Ali](https://github.com/tanavishali52)



## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced AI model integration
- [ ] Team collaboration features
- [ ] Custom agent templates
- [ ] Webhook integrations
- [ ] API rate limiting
- [ ] Advanced analytics dashboard
- [ ] Mobile app

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Documentation](https://redux.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

---

Made with ❤️ by the Nexus AI Team
