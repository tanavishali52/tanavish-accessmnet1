---
description: Implements Framer Motion animations in NexusAI Hub. Use when tasks involve adding entrance/exit transitions, hover/tap feedback, stagger lists, page transitions, modal animations, or sidebar slide-ins.
---

# Framer Motion Patterns Skill

## Use This Skill When

- Adding entrance or exit animations to a new component.
- Implementing hover/tap feedback on buttons or cards.
- Animating a list where items stagger in sequence.
- Building a modal, drawer, or sidebar that slides/fades in.
- Fixing a missing exit animation (element disappears instantly).

## Standard Duration & Easing Tokens

Always use these values — never invent custom ones:

```ts
// Copy-paste these constants into the component file if needed
const DURATION = { fast: 0.15, base: 0.25, slow: 0.4, xslow: 0.6 };
const EASE = {
  out:    [0.0, 0.0, 0.2, 1],
  in:     [0.4, 0.0, 1.0, 1],
  inOut:  [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
};
```

## Pattern 1 — Simple Fade + Slide (Most Common)

For cards, panels, tooltips, and section reveals:

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
>
  {children}
</motion.div>
```

## Pattern 2 — AnimatePresence (Required for Exit)

Wrap any conditionally rendered element in `AnimatePresence`. Without it, exit animations are skipped entirely:

```tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="my-element"   // key is required for AnimatePresence to track
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

Use `mode="wait"` when only one item should be visible at a time (tabs, page routes).
Use `mode="sync"` (default) when items can overlap during transition.

## Pattern 3 — Stagger List

For `ModelCard` grids, agent lists, and research results:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.0, 0.0, 0.2, 1] } },
};

// Usage
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      <ModelCard model={item} />
    </motion.li>
  ))}
</motion.ul>
```

## Pattern 4 — Button / Card Interaction

Standardized scale values — do not deviate:

```tsx
// Standard button
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
  Click me
</motion.button>

// Model card / agent card
<motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.99 }}>
  <ModelCard />
</motion.div>

// Icon-only button
<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
  <FiX />
</motion.button>
```

Never exceed `scale: 1.05` on hover — it causes layout shift.

## Pattern 5 — Sidebar / Drawer Slide

Left sidebar (ChatSidebar, AppNav):

```tsx
<motion.aside
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '-100%' }}
  transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
>
```

Right panel:

```tsx
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
```

## Pattern 6 — Modal

Backdrop + panel combination (ModelModal, AgentBuilder):

```tsx
{/* Backdrop */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 bg-black/50 z-40"
  onClick={onClose}
/>

{/* Panel */}
<motion.div
  initial={{ opacity: 0, scale: 0.96, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 12 }}
  transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
  className="fixed inset-0 z-50 flex items-center justify-center"
>
```

## Verification Checklist

- [ ] All conditionally rendered animated elements are inside `AnimatePresence`.
- [ ] Every `AnimatePresence` child has a unique `key` prop.
- [ ] Duration and ease values match the standard token table.
- [ ] Hover/tap scale values don't exceed `1.05` / go below `0.92`.
- [ ] No `width`/`height` animation — use `scaleX`/`scaleY` or the `layout` prop.
- [ ] No animation added to elements that re-render on every keystroke.
