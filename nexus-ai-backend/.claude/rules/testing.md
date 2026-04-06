# Testing Rules

Every service and controller in NexusAI backend must have corresponding tests before being merged.

## 1. Unit Tests — Mock the Database

Unit test files are colocated at `src/<module>/<service>.spec.ts`. Never use a real database in unit tests — mock the Mongoose model:

```ts
// src/agents/agents.service.spec.ts
const mockAgentModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findOneAndUpdate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    AgentsService,
    { provide: getModelToken(Agent.name), useValue: mockAgentModel },
  ],
}).compile();
```

## 2. Test Structure

Each `describe` block maps to one service method. Each test covers both a happy path and at least one error path:

```ts
describe('AgentsService', () => {
  describe('findOne', () => {
    it('returns the agent when found', async () => { ... });
    it('throws NotFoundException when agent does not exist', async () => {
      mockAgentModel.exec.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
```

## 3. E2E Tests

E2E tests live in `test/` and use a real test database (`MONGODB_URI_TEST`):

```ts
// test/agents.e2e-spec.ts
it('GET /agents returns 401 without session', () =>
  request(app.getHttpServer()).get('/agents').expect(401)
);
```

E2E tests must never share state between runs — seed fresh data in `beforeAll` and clean up in `afterAll`.

## 4. Coverage Thresholds

```js
coverageThreshold: {
  global: { branches: 70, functions: 80, lines: 80, statements: 80 }
}
```

PRs that drop below these thresholds must include a justification.

## 5. What Must Be Tested

- All CRUD service methods (happy path + not found + conflict)
- Auth service: successful login, wrong password, duplicate email
- DTO validation: valid inputs pass; invalid inputs (missing required, too long, bad enum) are rejected
- E2E: 401 on all protected routes without a session; 400 on invalid body

## 6. Cleanup Between Tests

Always call `jest.clearAllMocks()` in `afterEach` to prevent test bleed between cases.
