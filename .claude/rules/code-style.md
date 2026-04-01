---
description: Definitive code style rules and conventions for Nexus AI Hub codebase.
---

# Code Style Rules

These rules dictate how code must be structured before being merged into the codebase.

## 1. File Naming Conventions
- **React Components:** Use `PascalCase` (e.g., `ChatArea.tsx`, `ModalProvider.tsx`).
- **Hooks & Utilities:** Use `camelCase` (e.g., `useScroll.ts`, `stringUtils.ts`).
- **Next.js Routing:** Next.js uses specific filenames (`page.tsx`, `layout.tsx`, `route.ts`). Keep them strictly lowercase.
- **Redux Slices:** Use `camelCase` and append `Slice` (e.g., `chatSlice.ts`, `appSlice.ts`).

## 2. Imports and Exports
- **Absolute Imports:** Import from `src/` whenever possible instead of using confusing relative paths `../../`. Use `@/` alias if configured in TS.
- **Default vs Named:** Prefer named exports for utilities and hooks. Default exports are only required where frameworks demand them (e.g., Next.js pages, layouts, `React.lazy` imports).
- Import external libraries first, followed by Next.js/React internals, followed by local components, followed by static assets/styles.

## 3. Typings (TypeScript)
- Never use `any`. Use `unknown` or narrow the type appropriately.
- For props, explicitly define the `interface`:
  ```tsx
  interface Props {
    message: string;
    isUser?: boolean; // Use optional chaining for non-required props
  }
  ```
- Keep Redux action payloads strictly typed `PayloadAction<YourType>`.

## 4. Component Structure
- Always use functional components. Arrow functions are preferred.
- Only export one primary component per file.
- Colocate small helper functions below the main component export if they are strictly internal to that component, otherwise move to `src/utils/`.

## 5. Styling
- Sort Tailwind CSS classes logically (layout > typography > colors > modifiers): `flex flex-col items-center justify-center text-sm bg-bg text-text1 hover:bg-bg2`.
- Do not mix pure CSS or SCSS modules unless absolutely necessary. Rely solely on custom `tailwind.config.js` tokens.
