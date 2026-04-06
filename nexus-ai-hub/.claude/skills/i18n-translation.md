---
description: Adds and manages translation keys in NexusAI Hub. Use when tasks involve making hardcoded strings translatable, adding a new locale, updating existing translations, or integrating useTranslation() into a component.
---

# i18n Translation Skill

## Use This Skill When

- A component has hardcoded user-visible strings that need to be translatable.
- A new feature is being added and all strings must go into locale files from the start.
- Adding a new language to the platform.
- Renaming or reorganising existing translation keys.

## Setup Reference

- **Config**: `src/lib/i18n.ts`
- **Provider**: `src/providers/LocalizationProvider.tsx`
- **Locale Switcher**: `src/components/shared/LanguageSwitcher.tsx`
- **Locale Files**: `public/locales/<lang>/translation.json`

## Step-by-Step: Making a String Translatable

### Step 1 — Design the key name

Convention: `<feature>.<component>.<element>` (max 4 levels, all lowercase with dots)

```
landing.hero.title
landing.hero.subtitle
chat.input.placeholder
chat.input.send
agents.builder.step.configure.title
marketplace.filter.placeholder
auth.login.title
auth.login.cta
errors.network.generic
```

### Step 2 — Add to all locale files

Add the real English value to `public/locales/en/translation.json` (source of truth).
Add `"TODO: translate"` to every other locale file.

```json
// en/translation.json
{ "chat": { "input": { "placeholder": "Ask anything about AI models..." } } }

// ar/translation.json
{ "chat": { "input": { "placeholder": "TODO: translate" } } }
```

### Step 3 — Use in the component

```tsx
import { useTranslation } from 'react-i18next';

const ChatInput = () => {
  const { t } = useTranslation();
  return <input placeholder={t('chat.input.placeholder')} />;
};
```

## Interpolation & Pluralization

```tsx
// Dynamic value
// en: "Hello, {{name}}!"
t('dashboard.greeting', { name: user.name })

// Pluralization — use _one / _other suffixes
// en: { "agents": { "count_one": "{{count}} agent", "count_other": "{{count}} agents" } }
t('agents.count', { count: agents.length })
```

Never concatenate strings with `+` — always use interpolation keys.

## Adding a New Language

1. Create `public/locales/<lang>/translation.json` — copy `en` structure, set all values to `"TODO: translate"`.
2. Add the code to `supportedLngs` in `src/lib/i18n.ts`.
3. Add the option to `LanguageSwitcher.tsx`.
4. For RTL languages (Arabic, Hebrew), add `dir="rtl"` in `app/layout.tsx`.

## Verification Checklist

- [ ] No hardcoded user-visible strings remain in the component.
- [ ] New keys added to **every** locale file.
- [ ] Key names follow `feature.component.element` (max 4 levels, lowercase + dots).
- [ ] Dynamic values use `{{ }}` interpolation — no string concatenation.
- [ ] New language added to `supportedLngs` in `i18n.ts` and to `LanguageSwitcher`.
