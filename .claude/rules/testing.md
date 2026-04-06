# Testing Rules

Every feature merged into NexusAI must have corresponding tests. This rule covers unit tests for backend services, E2E tests for API routes, and the testing boundaries that apply to both frontend and backend.

## 1. Backend Unit Tests (NestJS Services)

Every service method must have a corresponding spec file at `src/<module>/<service>.spec.ts`.

### Test Structure

```ts
// src/agents/agents.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';

describe('AgentsService', () => {
  let service: AgentsService;
  const mockAgentModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: getModelToken(Agent.name), useValue: mockAgentModel },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(service).toBeDefined());

  describe('create', () => {
    it('should create an agent and return it', async () => {
      const dto = { name: 'Test Agent', modelId: 'gpt-4', systemPrompt: 'You are...', memoryMode: 'none', tools: [] };
      const userId = 'user-123';
      const created = { _id: 'agent-1', ...dto, userId };
      mockAgentModel.create.mockResolvedValue(created);

      const result = await service.create(userId, dto as any);
      expect(result).toEqual(created);
      expect(mockAgentModel.create).toHaveBeenCalledWith({ ...dto, userId });
    });
  });
});
```

### Rules

- **Never use a real database in unit tests** — mock the Mongoose model as shown above.
- Each `describe` block maps to one service method.
- Test both the **happy path** and at least one **error path** per method.
- Use `jest.clearAllMocks()` in `afterEach` to prevent test bleed.

## 2. Backend E2E Tests

E2E tests live in `test/` at the backend root and use a real (test) MongoDB database:

```ts
// test/agents.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('AgentsController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /agents — returns 401 when unauthenticated', () => {
    return request(app.getHttpServer())
      .get('/agents')
      .expect(401);
  });
});
```

E2E tests must use a **separate test database** configured via `MONGODB_URI_TEST` environment variable.

## 3. Frontend Tests

Frontend tests use Jest + React Testing Library. Test files are colocated with components: `ComponentName.test.tsx`.

```tsx
// ChatInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('renders the placeholder text', () => {
    render(<Provider store={store}><ChatInput /></Provider>);
    expect(screen.getByPlaceholderText(/ask anything/i)).toBeInTheDocument();
  });

  it('does not submit on empty input', () => {
    const onSend = jest.fn();
    render(<Provider store={store}><ChatInput onSend={onSend} /></Provider>);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
```

## 4. Coverage Thresholds

Configure in `jest.config.js` (backend) and `jest.config.ts` (frontend):

```js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

PRs that drop coverage below these thresholds must include a justification comment.

## 5. What Must Be Tested

| Layer | Must Test |
|---|---|
| Service methods | All CRUD operations, error paths (not found, conflict), ownership checks |
| Auth service | Successful login, wrong password, duplicate email on signup |
| DTOs | Valid inputs pass; invalid inputs (missing required, too long, wrong enum) are rejected |
| E2E | 401 on all protected routes without a session; 400 on invalid body |
| Frontend components | Render output, user interactions, empty/error/loading states |

## 6. What NOT to Test

- Private implementation details inside a service (only test via public methods).
- Third-party library internals (Mongoose, NestJS wiring).
- Static data in `src/data/` files.
- Visual/CSS styling — use the QA agent for manual UI checks.
