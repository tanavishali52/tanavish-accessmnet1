---
description: Implements Framer Motion animations in NexusAI Hub. Use when tasks involve entrance/exit transitions, hover/tap feedback, stagger lists, page transitions, modal animations, or sidebar slide-ins.
---

# Framer Motion Patterns Skill

## Use This Skill When

- Adding entrance or exit animations to a new component.
- Implementing hover/tap feedback on buttons or cards.
- Animating a list where items stagger in sequence.
- Building a modal, drawer, or sidebar that slides/fades in.
- Fixing a missing exit animation (element disappears instantly).

## Standard Duration & Easing Tokens

```ts
const DURATION = { fast: 0.15, base: 0.25, slow: 0.4, xslow: 0.6 };
const EASE = {
  out:   [0.0, 0.0, 0.2, 1],
  in:    [0.4, 0.0, 1.0, 1],
  inOut: [0.4, 0.0, 0.2, 1],
};
```

Use these values only — never invent custom durations or easings.

## Pattern 1 — Simple Fade + Slide (Most Common)

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 8 }}
  transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
>
```

## Pattern 2 — AnimatePresence (Required for Exit)

Any conditionally rendered element must be inside `AnimatePresence`. Without it, exit animations are skipped:

```tsx
<AnimatePresence mode="wait">
  {isVisible && (
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

Use `mode="wait"` for tab/page switches. Use default `mode="sync"` when overlap is acceptable.

## Pattern 3 — Stagger List (ModelCard grids, AgentCard lists)

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(i => <motion.li key={i.id} variants={item}><ModelCard /></motion.li>)}
</motion.ul>
```

## Pattern 4 — Button / Card Interaction

```tsx
// Standard button
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>

// ModelCard / AgentCard
<motion.div whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.99 }}>

// Icon-only button
<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
```

Never exceed `scale: 1.05` on hover — causes layout shift.

## Pattern 5 — Sidebar Slide (ChatSidebar, AppNav mobile)

```tsx
// Left sidebar
initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}

// Right panel
initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
```

## Pattern 6 — Modal (ModelModal, AgentBuilder)

```tsx
{/* Backdrop */}
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/50 z-40" />

{/* Panel */}
<motion.div
  initial={{ opacity: 0, scale: 0.96, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 12 }}
  transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
/>
```

## Verification Checklist

- [ ] All conditionally rendered animated elements are inside `AnimatePresence` with a unique `key`.
- [ ] Duration and ease match the standard token table above.
- [ ] Hover/tap scale within `1.02–1.05` / `0.92–0.99` range.
- [ ] No `width`/`height` animation — use `scaleX`/`scaleY` or the `layout` prop.
- [ ] No animation on elements that re-render on every keystroke.
- [ ] Exit animation tested — element should transition out, not disappear instantly.
