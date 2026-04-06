# Testing Rules

Every feature added to NexusAI Hub must have corresponding tests before being merged.

## 1. Test File Location

Colocate test files with the component or utility they test:

```
src/components/app/chat/ChatInput.tsx
src/components/app/chat/ChatInput.test.tsx

src/store/agentSlice.ts
src/store/agentSlice.test.ts
```

## 2. Component Tests

Use Jest + React Testing Library. Every component test must cover:
- **Render output**: the component renders without crashing with required props.
- **User interactions**: button clicks, input changes, form submissions.
- **State variations**: loading state (skeleton visible), error state (error message visible), loaded state (data visible).

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import ChatInput from './ChatInput';

it('does not submit on empty input', () => {
  const onSend = jest.fn();
  render(<Provider store={store}><ChatInput onSend={onSend} /></Provider>);
  fireEvent.click(screen.getByRole('button', { name: /send/i }));
  expect(onSend).not.toHaveBeenCalled();
});
```

## 3. Redux Slice Tests

Every slice must have a spec file testing:
- Initial state shape.
- Each reducer action (happy path + edge cases).
- Memoized selectors return the correct derived value.

```ts
import agentReducer, { addAgent, removeAgent } from './agentSlice';

it('adds an agent to the list', () => {
  const next = agentReducer(initialState, addAgent(mockAgent));
  expect(next.agents).toHaveLength(1);
});
```

## 4. Hook Tests

Hooks tested with `@testing-library/react` `renderHook`. Mock API calls with `jest.fn()`.

## 5. Coverage Thresholds

```js
coverageThreshold: {
  global: { branches: 70, functions: 80, lines: 80, statements: 80 }
}
```

PRs that drop below these thresholds must include justification.

## 6. What Must Be Tested

| Layer | Must Test |
|---|---|
| Components | Render, interactions, loading/error/loaded states |
| Slices | All reducers, initial state, memoized selectors |
| Hooks | All state transitions, API mock scenarios |
| Forms | Valid submission, invalid field (client-side), server error display |

## 7. What NOT to Test

- Tailwind CSS classes or visual styling.
- Third-party library internals (Redux, Framer Motion, i18next).
- Static data arrays that never change.
- `console.log` outputs.
