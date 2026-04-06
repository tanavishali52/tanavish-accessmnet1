# Accessibility Rules

All user interfaces in NexusAI Hub must meet WCAG 2.1 Level AA. These rules apply to every component and are verified before each PR merge.

## 1. Icon-Only Buttons — aria-label Required

Every `<button>` that renders only an icon must have a descriptive `aria-label`:

```tsx
// Wrong
<button onClick={onClose}><FiX size={18} /></button>

// Correct
<button onClick={onClose} aria-label="Close modal"><FiX size={18} /></button>
```

Applies to: AppNav tab icons, modal close buttons, chat send button, filter toggles.

## 2. No `div` or `span` as Interactive Elements

Use `<button>` for actions, `<a href>` for navigation. If a non-semantic element must handle clicks, add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler:

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleSelect}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect(); }}
>
```

## 3. Modal Focus Trapping

When `ModelModal` or `AgentBuilder` opens:
- Move focus to the first focusable element inside the modal.
- Trap Tab/Shift+Tab cycling within it.
- `Escape` must close the modal.
- On close, return focus to the element that triggered the open.
- Apply `role="dialog"`, `aria-modal="true"`, `aria-labelledby=<title-id>`.

## 4. Decorative Icons — aria-hidden

Icons inside labeled buttons or beside visible text are decorative — hide them from screen readers:

```tsx
<button>
  <FiPlus aria-hidden="true" size={16} />
  Add Agent
</button>
```

## 5. Form Inputs — Labels and Error Linking

Every input must have an associated `<label>` via `htmlFor`/`id`. Errors must use `role="alert"` and link via `aria-describedby`. Set `aria-invalid="true"` when an error exists.

## 6. Color Contrast Minimums

| Text Type | Minimum Ratio |
|---|---|
| Normal text (< 18px or < 14px bold) | 4.5 : 1 |
| Large text (≥ 18px or ≥ 14px bold) | 3 : 1 |
| UI components (borders, icons, focus rings) | 3 : 1 |

Verify `--text1` and `--text2` on `--bg` meet these ratios. Placeholder text must also meet 4.5:1.

## 7. Live Regions for Dynamic Content

Toast notifications: `role="status"` (info/success) or `role="alert"` (errors).
New chat messages: wrapped in `aria-live="polite"` so screen readers announce them.

## 8. AppNav Tabs — ARIA Tabs Pattern

Container: `role="tablist"`. Each tab: `role="tab"`, `aria-selected={isActive}`, `tabIndex={isActive ? 0 : -1}`. Content panels: `role="tabpanel"`, `aria-labelledby={tabId}`. Arrow keys navigate; Enter/Space activates.

## 9. Images

- Informational: `alt` describes content — `alt="GPT-5 model icon"`.
- Decorative: `alt=""` (empty string, not omitted).
- Logo: `alt="Nexus AI logo"`.

## 10. Focus Visible Styles

Never use `focus:outline-none` without a visible replacement:

```tsx
// Required pattern
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```
