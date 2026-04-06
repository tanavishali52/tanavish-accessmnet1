---
description: Implements skeleton loading states in NexusAI Hub. Use when tasks involve adding loading placeholders, wiring the Skeleton component to Redux status, or auditing missing loading states across views.
---

# Skeleton Loading Skill

## Use This Skill When

- A component fetches async data and has no loading placeholder.
- A new feature needs a skeleton before its data is ready.
- Auditing the app for views that show empty states instead of skeletons during loading.
- Ensuring skeletons match the approximate size/shape of the loaded content.

## The Skeleton Component

The shared `Skeleton` component lives at `src/components/shared/Skeleton.tsx`. Use it — never build a custom shimmer from scratch:

```tsx
import Skeleton from '@/components/shared/Skeleton';

// Basic usage — mirrors the dimensions of the real content
<Skeleton className="h-6 w-48 rounded-md" />          // text line
<Skeleton className="h-32 w-full rounded-xl" />        // card
<Skeleton className="h-10 w-10 rounded-full" />        // avatar
```

Pass Tailwind classes for `height`, `width`, and `border-radius` to match the real element's shape. The shimmer animation is built into the component.

## When to Show a Skeleton

Always show the skeleton when the Redux `status` is `'loading'`. Never show an empty view or `null`:

```tsx
const { items, status } = useSelector((state: RootState) => state.models);

if (status === 'loading' || status === 'idle') return <ModelGridSkeleton />;
if (status === 'error') return <ErrorMessage />;
return <ModelGrid items={items} />;
```

Treat `'idle'` the same as `'loading'` — data hasn't been requested yet so the skeleton is still appropriate.

## Skeleton Layout Patterns

### Text Block (3 lines of varying width)

```tsx
const TextSkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-4 w-full rounded" />
    <Skeleton className="h-4 w-1/2 rounded" />
  </div>
);
```

### Model Card Skeleton (matches ModelCard dimensions)

```tsx
const ModelCardSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 rounded-xl border border-bg2">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
    <Skeleton className="h-3 w-full rounded" />
    <Skeleton className="h-3 w-4/5 rounded" />
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
);
```

### Grid Skeleton (repeat N times)

```tsx
const ModelGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <ModelCardSkeleton key={i} />
    ))}
  </div>
);
```

### Chat Message Skeleton

```tsx
const ChatMessageSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {[80, 60, 90].map((width, i) => (
      <Skeleton key={i} className={`h-4 w-[${width}%] rounded`} />
    ))}
  </div>
);
```

### Sidebar List Skeleton

```tsx
const SidebarSkeleton = () => (
  <div className="flex flex-col gap-2 p-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-9 w-full rounded-lg" />
    ))}
  </div>
);
```

## Skeleton Size Rules

| Content Type | Height | Width | Radius |
|---|---|---|---|
| Heading (h1-h2) | `h-7` or `h-8` | `w-48` to `w-64` | `rounded-md` |
| Body text line | `h-4` | varies (use `w-full`, `w-3/4`) | `rounded` |
| Small label / tag | `h-3` | `w-16` to `w-24` | `rounded` |
| Avatar / icon | `h-10 w-10` | — | `rounded-full` |
| Card | `h-32` to `h-48` | `w-full` | `rounded-xl` |
| Button | `h-10` | `w-full` or `w-32` | `rounded-lg` |
| Input field | `h-10` | `w-full` | `rounded-lg` |

## Verification Checklist

- [ ] Every component that reads from a Redux slice shows a skeleton when `status === 'loading'`.
- [ ] `'idle'` status also shows the skeleton (not a blank page).
- [ ] Skeleton dimensions approximately match the real content's size and shape.
- [ ] Grid skeletons render the same number of placeholder items as the expected data count.
- [ ] No raw `null` returns during loading — always return a skeleton.
- [ ] Skeleton is imported from `@/components/shared/Skeleton`, not custom built.
