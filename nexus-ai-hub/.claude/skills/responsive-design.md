---
description: Audits and implements mobile-first responsive design in NexusAI Hub. Use when tasks involve UI layout changes, media queries, or mobile vs. desktop visibility.
---

# Responsive Design Skill

## Use This Skill When

- Modifying the layout of main workspace views (`Chat`, `Marketplace`, `Agents`, `Research`).
- Ensuring the `AppNav` (mobile sidebar) and main navigation work correctly on all screens.
- Adjusting grid columns (`grid-cols-*`) for mobile vs. desktop.
- Font size adjustments for smaller screens.

## Project Breakpoints (Tailwind)

- `sm:` (640px) - Tablets / Small tablets.
- `md:` (768px) - iPads / Small laptops.
- `lg:` (1024px) - Desktops.
- `xl:` (1280px) - Large screens.

## Design Patterns

### 1. Mobile-First Sidebars
- The `ChatSidebar` and `AppNav` should use a mobile-first approach.
- Base styles: `fixed inset-y-0 w-full z-50 transform -translate-x-full` for mobile.
- Desktop styles: `md:relative md:translate-x-0 md:w-80`.

### 2. Responsive Grids
- **Marketplace**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for model cards.
- **Agents**: `grid-cols-1 sm:grid-cols-2` for templates.

### 3. Fluid Typography
- Use `text-[0.9rem]` or similar units for fine control.
- Adjust headers: `text-[1.8rem] sm:text-[2.2rem]`.

### 4. Interactive Elements
- Touch targets should be at least `44px` on mobile.
- Use `whileTap={{ scale: 0.97 }}` from Framer Motion for better mobile feedback.

## Verification Checklist

- [ ] UI is functional and centered on Chrome DevTools "iPhone 12 Pro".
- [ ] No horizontal scrolling on mobile.
- [ ] Sidebar overlays or toggles work correctly with `AnimatePresence`.
- [ ] Grid layouts don't break at `768px` (iPad range).
