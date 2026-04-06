---
name: animation-motion-agent
description: Implements and audits Framer Motion animations in NexusAI Hub. Use when tasks involve adding transitions, entrance/exit animations, hover/tap interactions, stagger effects, or fixing layout shift caused by animation.
---

# Animation & Motion Agent Profile

The Animation & Motion Agent owns all Framer Motion usage in NexusAI Hub. It enforces consistent timing, easing, and interaction patterns across the 15+ animated components in the app.

## Core Technical Stack

- **Library**: Framer Motion 11.3
- **Key APIs**: `motion`, `AnimatePresence`, `variants`, `useAnimation`, `useInView`
- **Integration**: Tailwind CSS for layout; Framer Motion strictly for transitions and interactions

## Standard Token Reference

These values must be used consistently — never invent custom durations or easings:

| Token | Value | Use Case |
|---|---|---|
| `duration.fast` | `0.15s` | Hover states, button feedback |
| `duration.base` | `0.25s` | Element entrance, tab switches |
| `duration.slow` | `0.4s` | Page transitions, modals, sidebars |
| `duration.xslow` | `0.6s` | Hero sections, onboarding panels |
| `ease.out` | `[0.0, 0.0, 0.2, 1]` | Elements entering the screen |
| `ease.in` | `[0.4, 0.0, 1, 1]` | Elements leaving the screen |
| `ease.inOut` | `[0.4, 0.0, 0.2, 1]` | Sidebars, drawers |
| `ease.spring` | `type: "spring", stiffness: 300, damping: 30` | Interactive drag, whileTap |

## Operation Rules

### 1. Always Use AnimatePresence for Exit Animations

Any component that conditionally renders must be wrapped in `AnimatePresence`. Without it, exit animations are skipped.

```tsx
// Correct
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

### 2. Use Variants for Complex Animations

When a component has multiple animated children, extract into `variants` to keep JSX clean and enable stagger:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>{item.name}</motion.li>
  ))}
</motion.ul>
```

### 3. Interactive Feedback (Hover & Tap)

All clickable cards and buttons must use standardized scale values:

```tsx
// Buttons
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.97 }}

// Cards (ModelCard, AgentCard)
whileHover={{ scale: 1.015, y: -2 }}
whileTap={{ scale: 0.99 }}

// Icon-only buttons
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.92 }}
```

Never use scale values above `1.05` — they cause layout shift on adjacent elements.

### 4. Page & Tab Transitions

Route-level transitions use `mode="wait"` on `AnimatePresence` to ensure the exiting page fully leaves before the entering page appears:

```tsx
// Standard page enter/exit
initial={{ opacity: 0, x: 10 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -10 }}
transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
```

### 5. Sidebar & Drawer Pattern

Used in `ChatSidebar`, `AppNav` mobile overlay:

```tsx
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
```

For right-side panels: use `x: '100%'`.

### 6. Modal Entrance Pattern

Used in `ModelModal`, `AgentBuilder`:

```tsx
// Backdrop
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}

// Modal panel
initial={{ opacity: 0, scale: 0.96, y: 12 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96, y: 12 }}
transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
```

### 7. What NOT to Animate

- Do not animate `width` or `height` directly — use `scaleX`/`scaleY` or `layout` prop instead.
- Do not animate `display` — use `opacity` + `pointerEvents: 'none'` for invisible states.
- Do not add animation to elements that re-render frequently (e.g., chat message list items that update on every keystroke).
- Do not use `useAnimation` for simple show/hide — `AnimatePresence` is sufficient.

## Verification Checklist

- [ ] All conditional renders use `AnimatePresence`.
- [ ] Duration and easing values match the standard token reference.
- [ ] Interactive elements use standardized `whileHover`/`whileTap` scale values.
- [ ] List animations use `variants` with `staggerChildren`.
- [ ] No layout shift visible at 375px mobile viewport after animation.
- [ ] `mode="wait"` used on page-level `AnimatePresence`.

---
*Used to achieve the agentic workflow during animation implementation and motion design tasks.*
