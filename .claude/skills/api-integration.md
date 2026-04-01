---
description: Manages and implements API integrations in NexusAI Hub. Use when tasks involve adding new fetch calls, updating lib/api.ts, or managing Redux-to-Backend data flow.
---

# API Integration Skill

## Use This Skill When

-   Adding a new backend interaction (e.g., `apiCreateAgent`, `apiModels`).
-   Refactoring existing frontend API logic in `src/lib/api.ts`.
-   Integrating Redux status management with backend responses.
-   Handling standardized success and error messages from the backend.

## Core Integration Utility: `request<T>`

All API calls must use the shared `request<T>` helper located in `src/lib/api.ts`. This utility handles:
-   **Standardized Structure**: Returns `BackendResponse<T>` and automatically unwraps the `data` field.
-   **Credentials**: Always sends `credentials: 'include'` for secure cookie-based session management.
-   **Error Bubbling**: Automatically throws an `Error` with the backend's `message` if `success` is false.

### Success Pattern

```ts
export function apiModels() {
  return request<Model[]>('/catalog/models');
}
```

### Error Handling

Never handle raw fetch errors in components if possible. Let the `request` utility throw, and catch the `Error` in your Redux action or component's `try/catch` block to show a toast or update state.

## Redux Integration Pattern

When integrating an API call with Redux, follow the `idle | loading | loaded | error` pattern for the `status` field:

1.  **Start State**: Dispatch `setXLoading()` to trigger skeletons/placeholders.
2.  **Success State**: Dispatch `setX(data)` which **must** also set `status: 'loaded'`.
3.  **Error State**: Dispatch `setXError()` on catch, which sets `status: 'error'`.

## Backend Response Contract

The backend adheres to a strict contract:
-   **Success**: `{ "success": true, "message": "Success", "data": ... }`
-   **Error**: `{ "success": false, "message": "Reason for error", "errors": ... }`

## Troubleshooting

-   **CORS**: Ensure `process.env.NEXT_PUBLIC_API_URL` is correctly configured.
-   **Session Lost**: Check if `credentials: 'include'` is present in the `request` call.
-   **Unwrapping**: Verify that the return type of your API function matches the `data` field of the backend response.

## Real-World Example: Chat Message

**Endpoint**: `POST /chat/message`

### Request Payload
```json
{
  "message": "hello 123",
  "context": { "goal": "Data Analysis" }
}
```

### Backend Response (Standardized)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "text": "Based on your query, here are the best matching models:",
    "recs": [
      { "id": "gpt5", "name": "GPT-5.4", "lab": "OpenAI" },
      { "id": "claude-opus", "name": "Claude Opus 4.6", "lab": "Anthropic" }
    ]
  }
}
```

### Frontend Usage
```ts
const reply = await apiChatMessage("hello 123");
console.log(reply.text); // "Based on your query..."
console.log(reply.recs); // Array of model recommendations
```

## Verification Checklist

-   [ ] Endpoint is added correctly to `src/lib/api.ts` with explicit TypeScript types.
-   [ ] `request<T>` is used for all fetch operations.
-   [ ] Loading state transitions are handled in Redux.
-   [ ] Standardized error messages are visible to the user on failure.
