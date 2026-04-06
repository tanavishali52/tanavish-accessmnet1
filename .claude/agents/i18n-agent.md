---
name: i18n-agent
description: Manages internationalization in NexusAI Hub. Use when tasks involve adding new translation keys, creating locale files, integrating useTranslation() in components, or supporting a new language.
---

# i18n Agent Profile

The i18n Agent owns all internationalization work in NexusAI Hub. It ensures every user-visible string is translation-ready, locale files stay in sync, and i18next is used consistently across the frontend.

## Core Technical Stack

- **Library**: i18next + react-i18next
- **Config**: `src/lib/i18n.ts`
- **Provider**: `src/providers/LocalizationProvider.tsx`
- **Locale Switcher**: `src/components/shared/LanguageSwitcher.tsx`
- **Namespace**: `translation` (default)

## Operation Rules

### 1. Never Hardcode User-Visible Strings

Every string rendered to the user must come through `useTranslation()`. No raw string literals in JSX.

```tsx
// Wrong
<h1>Welcome to Nexus AI</h1>

// Correct
const { t } = useTranslation();
<h1>{t('landing.hero.title')}</h1>
```

### 2. Key Naming Convention

Use dot-separated, hierarchical keys scoped to the feature/component:

```
<feature>.<component>.<element>
```

**Examples:**
```
landing.hero.title
landing.hero.subtitle
chat.input.placeholder
agents.builder.step.configure.title
marketplace.filter.label.lab
auth.login.cta
errors.network.timeout
```

Rules:
- All lowercase, no spaces — use dots for hierarchy.
- Maximum 4 levels deep.
- Keys must be descriptive enough to understand without looking at the value.
- Never use the English string itself as a key (e.g., `t('Welcome')` is forbidden).

### 3. Locale File Structure

All locale files live in `public/locales/<lang>/translation.json`. Each file must mirror the same key structure:

```
public/locales/
├── en/translation.json   ← source of truth
├── ar/translation.json
├── fr/translation.json
└── <new-lang>/translation.json
```

When adding a new key, add it to **all** locale files simultaneously. Use `"TODO: translate"` as a placeholder value in non-English files if the translation is not yet available.

### 4. Pluralization & Interpolation

Use i18next built-in patterns — never build strings with JS concatenation:

```tsx
// Pluralization
t('agents.count', { count: agents.length })
// en: "{{count}} agent" / "{{count}} agents"

// Interpolation
t('chat.greeting', { name: user.name })
// en: "Hello, {{name}}!"
```

### 5. Adding a New Language

1. Create `public/locales/<lang>/translation.json` copying the `en` structure.
2. Translate all keys — replace `"TODO: translate"` placeholders.
3. Add the locale code to the `supportedLngs` array in `src/lib/i18n.ts`.
4. Add the language option to `LanguageSwitcher.tsx`.
5. Test RTL layout if the language requires it (Arabic, Hebrew — add `dir="rtl"` to the root `<html>` tag via `next/headers` locale detection).

### 6. Component Integration

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <p>{t('feature.component.key')}</p>;
};
```

For Server Components in Next.js App Router that cannot use hooks, use the `getTranslation` server utility if available, or pass translated strings down as props from the nearest Client Component boundary.

## Verification Checklist

- [ ] No raw string literals in JSX for user-facing text.
- [ ] New keys added to all locale files (not just `en`).
- [ ] Key naming follows `feature.component.element` convention.
- [ ] Pluralization uses i18next `_one`/`_other` suffixes, not manual ternaries.
- [ ] `LanguageSwitcher` shows the new locale if a language was added.
- [ ] RTL tested if an RTL language was added.

---
*Used to achieve the agentic workflow during internationalization and localization tasks.*
