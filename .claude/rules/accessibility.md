# Accessibility Rules

All user interfaces in NexusAI Hub must meet WCAG 2.1 Level AA. These rules are enforced by the Accessibility Agent and verified before every PR merge.

## 1. Icon-Only Buttons — aria-label Required

Any `<button>` that renders only an icon (no visible text) must have an `aria-label` describing the action:

```tsx
// Wrong
<button onClick={onClose}><FiX size={18} /></button>

// Correct
<button onClick={onClose} aria-label="Close modal"><FiX size={18} /></button>
```

This applies to: all icon buttons in `AppNav`, close buttons in modals, the chat send button, filter toggles, and any future icon-only interactive element.

## 2. No `div` or `span` as Interactive Elements

Only use `<button>` for actions and `<a href>` for navigation. If a `div` or `span` must handle clicks (e.g., a custom card), it must include:

- `role="button"` (or the appropriate ARIA role)
- `tabIndex={0}` to make it keyboard-reachable
- `onKeyDown` handler for `Enter` and `Space`

```tsx
// Correct pattern for interactive non-button elements
<div
  role="button"
  tabIndex={0}
  onClick={handleSelect}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect(); }}
>
```

## 3. Modal Focus Management

When a modal or drawer opens, focus must move inside it. When it closes, focus must return to the trigger element:

- Move focus to the first focusable element on open.
- Trap Tab/Shift+Tab cycling within the modal while it is open.
- `Escape` key must close the modal and return focus to the trigger.
- Apply `aria-modal="true"` and `role="dialog"` on the modal container.
- Apply `aria-labelledby` pointing to the modal's visible title element.

## 4. Decorative Icons — aria-hidden

Icons that are purely decorative (inside a button that already has text, or beside a label) must be hidden from screen readers:

```tsx
// Icon next to button label — decorative
<button>
  <FiPlus aria-hidden="true" size={16} />
  Add Agent
</button>

// Icon alone — not decorative, needs aria-label on the button instead
<button aria-label="Add agent"><FiPlus size={16} /></button>
```

## 5. Form Inputs — Labels and Error Linking

Every form field must have:
- A `<label>` associated via `htmlFor` matching the input's `id`.
- `aria-describedby` pointing to the error message element when an error is present.
- `aria-invalid="true"` on the input when it has a validation error.
- Error messages must use `role="alert"` so screen readers announce them immediately.

```tsx
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

## 6. Color Contrast — Minimum Ratios

All text and interactive element combinations must meet these minimums:

| Text Size | Minimum Contrast Ratio |
|---|---|
| Normal text (< 18px or < 14px bold) | 4.5 : 1 |
| Large text (≥ 18px or ≥ 14px bold) | 3 : 1 |
| UI components (borders, icons, focus rings) | 3 : 1 |

Do not use `--text2` on `--bg` for body text without verifying the ratio. Placeholder text must still meet 4.5:1.

## 7. Live Regions for Dynamic Content

When content updates without a page reload (new chat messages, toast notifications, status changes), use ARIA live regions so screen readers announce the update:

```tsx
// Toast component
<div role="status" aria-live="polite">   {/* for success/info */}
<div role="alert" aria-live="assertive"> {/* for errors */}

// Chat message list — announce new messages
<div aria-live="polite" aria-atomic="false">
  {messages.map(msg => <ChatMessage key={msg.id} {...msg} />)}
</div>
```

## 8. Tab Navigation Order — AppNav

The `AppNav` tabs (Chat, Marketplace, Agents, Research) must be navigable with arrow keys following the ARIA tabs pattern:

- Container: `role="tablist"`
- Each tab: `role="tab"`, `aria-selected={isActive}`, `tabIndex={isActive ? 0 : -1}`
- Content panels: `role="tabpanel"`, `aria-labelledby={tabId}`
- Arrow Left/Right moves focus between tabs; `Enter`/`Space` activates.

## 9. Images — Meaningful Alt Text

- Informational images: `alt` describes the content (`alt="GPT-5 model icon"`).
- Decorative images: `alt=""` (empty string — do not omit the attribute).
- Logo: `alt="Nexus AI logo"`.
- Never use the filename or a generic word like "image" as alt text.

## 10. Focus Visible Styles

Every focusable element must have a visible focus indicator. Do not use `outline: none` or `focus:outline-none` without providing an alternative:

```tsx
// Acceptable replacement — visible ring
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

`focus:outline-none` without `focus-visible:ring-*` is forbidden.
