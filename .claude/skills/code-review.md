---
description: Reviews and refactors code in NexusAI Hub. Use when tasks involve code organization, Redux state management, API integration, or Component structure.
---

# Code Review Skill

## Stack & Architecture

- **Next.js**: App Router (`src/app/`) with server and client components.
- **Redux Toolkit**: Centralized state management in `src/store/`.
- **Styling**: Tailwind CSS with custom global CSS variables for design consistency.
- **Animation**: Framer Motion for all transitions and interactions.
- **Typescript**: Strict-type definitions for all data models and API responses.

## Core Review Checklist

### 1. State Management (Redux)
- Use `useSelector` with `RootState` type.
- Use `useDispatch` for all actions.
- Ensure all slices follow the `idle | loading | loaded | error` status pattern.
- Logic should be in the slice (`reducers`), not inside the component when possible.

### 2. API Integration
- Use the shared `request` helper in `src/lib/api.ts`.
- Ensure all API calls unwrap the `data` field to handle the standardized backend response.
- Use the `BackendResponse<T>` interface for all requests.

### 3. Component Design
- Keep components small and focused.
- Ensure all headings use the `font-syne` font.
- Ensure all body text uses `font-instrument`.
- Use the shared `Skeleton` component for all loading states.
- Follow the color variables: `--accent`, `--text1`, `--text2`, etc.

### 4. Iconography
- Use `react-icons/fi` (Feather Icons) for consistency.
- Standard sizes: `15px` for button icons, `18px` for larger indicators.

## Performance & UX
- Use `AnimatePresence` for all exit animations.
- Prevent layout shifts by providing fixed dimensions or aspect ratios for images/skeletons.
- No `console.log` statements in production code.
- Ensure proper error boundaries or toast messages for API failures.
