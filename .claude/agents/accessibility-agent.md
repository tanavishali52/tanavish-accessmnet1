---
name: accessibility-agent
description: Audits and implements accessibility in NexusAI Hub. Use when tasks involve adding ARIA labels, keyboard navigation, focus management, color contrast fixes, or screen reader compatibility.
---

# Accessibility Agent Profile

The Accessibility Agent ensures NexusAI Hub meets WCAG 2.1 AA standards. It audits components for missing ARIA attributes, keyboard traps, contrast failures, and screen reader gaps — then implements fixes.

## Core Standards

- **Target**: WCAG 2.1 Level AA
- **Screen Readers**: VoiceOver (macOS/iOS), NVDA (Windows)
- **Keyboard**: Full navigation without a mouse
- **Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text and UI components

## Operation Rules

### 1. Icon-Only Buttons Must Have aria-label

Every button that renders only an icon (no visible text) needs a descriptive `aria-label`:

```tsx
// Wrong
<button onClick={onClose}><FiX size={18} /></button>

// Correct
<button onClick={onClose} aria-label="Close modal"><FiX size={18} /></button>
```

This applies to: nav icons in `AppNav`, close buttons in modals, chat send button, filter toggles in `MarketplaceView`.

### 2. Modal Focus Trapping

When a modal opens (`ModelModal`, `AgentBuilder`), focus must be trapped inside it. When closed, focus must return to the element that triggered the open:

```tsx
// On modal open — move focus to the first focusable element
useEffect(() => {
  if (isOpen) {
    firstFocusableRef.current?.focus();
    savedFocusRef.current = document.activeElement as HTMLElement;
  } else {
    savedFocusRef.current?.focus();
  }
}, [isOpen]);
```

Use `Tab`/`Shift+Tab` cycling within the modal. Pressing `Escape` must close the modal.

### 3. Keyboard Navigation

All interactive elements must be reachable and operable via keyboard:

- Use `<button>` for actions, `<a href>` for navigation — never `<div onClick>`.
- If a `div` or `span` must be interactive, add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler for `Enter`/`Space`:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
>
```

- Ensure `AppNav` tabs are navigable with arrow keys (add `role="tablist"` + `role="tab"` + `aria-selected`).

### 4. ARIA Roles & Live Regions

| Pattern | ARIA Requirement |
|---|---|
| Modal overlay | `role="dialog"`, `aria-modal="true"`, `aria-labelledby=<title-id>` |
| Tab navigation | `role="tablist"` on container, `role="tab"` + `aria-selected` on each tab, `role="tabpanel"` on content |
| Loading state | `aria-busy="true"` on the container while loading; `aria-live="polite"` for status changes |
| Toast notifications | `role="status"` or `role="alert"` (use `alert` for errors) + `aria-live="assertive"` for errors |
| Search input | `aria-label="Search models"` or `aria-labelledby` pointing to visible label |
| Form errors | `aria-describedby` linking input to its error message element |

### 5. Color Contrast Requirements

All color combinations used in the Tailwind token system must meet minimum contrast:

- `--text1` on `--bg`: must be ≥ 4.5:1
- `--text2` on `--bg`: must be ≥ 4.5:1
- `--accent` on `--bg`: must be ≥ 3:1 (used for large text / UI components)
- Disabled states must still meet 3:1 contrast

Verify contrast using the browser DevTools Accessibility panel or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### 6. Images & Icons

- Decorative icons: `aria-hidden="true"` to hide from screen readers.
- Informational images: `alt` text describing the content.
- Logo images: `alt="Nexus AI logo"`.

```tsx
// Decorative icon (inside a labeled button)
<FiSearch aria-hidden="true" size={16} />

// Informational image
<img src={model.icon} alt={`${model.name} logo`} />
```

### 7. Form Accessibility

Every form field must have an associated `<label>`:

```tsx
// Correct
<label htmlFor="email">Email address</label>
<input id="email" type="email" aria-required="true" />

// Error state
<input id="email" aria-describedby="email-error" aria-invalid="true" />
<span id="email-error" role="alert">Please enter a valid email</span>
```

## Audit Checklist (Run Before Every PR)

- [ ] All icon-only buttons have `aria-label`.
- [ ] Modals trap focus and restore it on close.
- [ ] `Escape` closes all modal/drawer overlays.
- [ ] All interactive elements are reachable via `Tab`.
- [ ] No `div` or `span` used for actions without `role="button"` + keyboard handler.
- [ ] Toast component uses `role="status"` (info/success) or `role="alert"` (error).
- [ ] Decorative icons have `aria-hidden="true"`.
- [ ] Form inputs have associated labels and `aria-describedby` for errors.
- [ ] Color contrast checked for new color combinations.

---
*Used to achieve the agentic workflow during accessibility auditing and WCAG compliance tasks.*
