---
description: Performs a final PR (Pull Request) review in NexusAI Hub. Use when tasks are finished to ensure quality, responsiveness, and design consistency.
---

# PR Review Skill

## Final Checklist Before Submission

### 1. Style & Design Consistency
- Headings use `font-syne`, body uses `font-instrument`.
- Iconography is strictly from `react-icons/fi`.
- Spacing and border-radials align with `--rounded`, `--rounded-lg`, etc.
- Standard colors: `--accent`, `--accent-lt`, `--text1`, `--text2`, etc.

### 2. Responsive Check (Desktop & Mobile)
- View is fully centered and usable on `375px` (Mobile) and `1440px` (Desktop).
- Sidebars/Navigation don't overlap with main content incorrectly.
- Breakpoints: `sm:`, `md:`, `lg:` are used for fluid transitions.

### 3. State & Logic
- Redux slices follow the `idle | loading | loaded | error` pattern.
- API calls use the `request` utility and unwrap `data`.
- Loading states (Skeletons) are implemented for all asynchronous data.
- Success and Error scenarios are handled with `Toast` components or UI messages.

### 4. Code Quality
- No `console.log` or debug code left in the codebase.
- File paths use absolute aliases (`@/components/...`, `@/store/...`).
- TypeScript types are explicit (no `any` where avoidable).
- Imports are sorted and unused ones are cleaned.

### 5. Accessibility
- All buttons have `aria-label` where icons are used without text.
- Images have descriptive `alt` tags.
- Color contrast is sufficient for accessibility standards.

## Verification Checklist

- [ ] `npm run lint` passes without errors.
- [ ] UI is tested on Mobile DevTools.
- [ ] No regression in other views.
- [ ] Walkthrough artifact summarizes all functional changes.
