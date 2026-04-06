---
description: Implements skeleton loading states in NexusAI Hub. Use when tasks involve adding loading placeholders, wiring the Skeleton component to Redux status, or auditing views that show blank states during loading.
---

# Skeleton Loading Skill

## Use This Skill When

- A component fetches async data and has no loading placeholder.
- A new feature needs a skeleton before its data is ready.
- Auditing the app for views that show blank states instead of skeletons.
- Ensuring skeletons match the approximate size/shape of the loaded content.

## The Skeleton Component

Use `src/components/shared/Skeleton.tsx` — never build a custom shimmer:

```tsx
import Skeleton from '@/components/shared/Skeleton';

<Skeleton className="h-6 w-48 rounded-md" />    // heading line
<Skeleton className="h-4 w-full rounded" />      // body text line
<Skeleton className="h-10 w-10 rounded-full" />  // avatar
<Skeleton className="h-32 w-full rounded-xl" />  // card
```

Pass Tailwind `h-*`, `w-*`, and `rounded-*` classes to match the real element's dimensions.

## When to Show a Skeleton

Show the skeleton when Redux `status` is `'loading'` **or** `'idle'`:

```tsx
const { items, status, error } = useSelector((s: RootState) => s.models);

if (status === 'loading' || status === 'idle') return <ModelGridSkeleton />;
if (status === 'error') return <ErrorMessage message={error} />;
return <ModelGrid items={items} />;
```

Treat `'idle'` the same as `'loading'` — data hasn't loaded yet so the skeleton is correct.

## Skeleton Layout Patterns

### Model Card Skeleton

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

### Model Grid Skeleton (MarketplaceView)

```tsx
const ModelGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => <ModelCardSkeleton key={i} />)}
  </div>
);
```

### Sidebar List Skeleton (ChatSidebar sessions)

```tsx
const SidebarSkeleton = () => (
  <div className="flex flex-col gap-2 p-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-9 w-full rounded-lg" />
    ))}
  </div>
);
```

### Agent Builder Step Skeleton

```tsx
const BuilderStepSkeleton = () => (
  <div className="flex flex-col gap-4 p-6">
    <Skeleton className="h-6 w-48 rounded-md" />
    <Skeleton className="h-4 w-full rounded" />
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);
```

## Skeleton Size Reference

| Content | Height | Width | Radius |
|---|---|---|---|
| H1/H2 heading | `h-7` or `h-8` | `w-48–w-64` | `rounded-md` |
| Body text line | `h-4` | `w-full`, `w-3/4` | `rounded` |
| Small label/tag | `h-3` | `w-16–w-24` | `rounded` |
| Avatar/icon | `h-10 w-10` | — | `rounded-full` |
| Card | `h-32–h-48` | `w-full` | `rounded-xl` |
| Button | `h-10` | `w-full` or `w-32` | `rounded-lg` |
| Input field | `h-10` | `w-full` | `rounded-lg` |

## Verification Checklist

- [ ] Every component reading from a Redux slice shows a skeleton when `status === 'loading'`.
- [ ] `'idle'` status also renders a skeleton — never a blank view.
- [ ] Skeleton dimensions approximately match the real content's shape.
- [ ] Grid skeletons render the same number of placeholders as expected data items.
- [ ] `Skeleton` imported from `@/components/shared/Skeleton` — not a custom element.
- [ ] No `null` returns during loading state.
