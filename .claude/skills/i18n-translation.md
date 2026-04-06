---
description: Adds and manages translation keys in NexusAI Hub. Use when tasks involve making a hardcoded string translatable, adding a new locale, updating existing translations, or integrating useTranslation() into a component.
---

# i18n Translation Skill

## Use This Skill When

- A component has hardcoded user-visible strings that need to be made translatable.
- A new feature is being added and all strings must go into locale files from the start.
- A new language is being added to the platform.
- Existing translation keys need to be renamed or reorganised.

## Step-by-Step: Making a String Translatable

### Step 1 — Identify the component and its hardcoded strings

Read the component and list every string that a user will see (labels, placeholders, headings, error messages, button text, tooltips).

### Step 2 — Design the key names

Follow the convention: `<feature>.<component>.<element>`

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

Rules:
- All lowercase with dots — no camelCase, no underscores.
- Maximum 4 levels deep.
- Keys must be self-describing without reading the value.

### Step 3 — Add keys to all locale files

Add to `public/locales/en/translation.json` (source of truth) with the real English value.
Add to every other locale file with `"TODO: translate"` if translation is not yet available.

```json
// public/locales/en/translation.json
{
  "chat": {
    "input": {
      "placeholder": "Ask anything about AI models...",
      "send": "Send"
    }
  }
}

// public/locales/ar/translation.json
{
  "chat": {
    "input": {
      "placeholder": "TODO: translate",
      "send": "TODO: translate"
    }
  }
}
```

### Step 4 — Update the component

```tsx
import { useTranslation } from 'react-i18next';

const ChatInput = () => {
  const { t } = useTranslation();

  return (
    <input placeholder={t('chat.input.placeholder')} />
    <button>{t('chat.input.send')}</button>
  );
};
```

## Interpolation & Pluralization

```tsx
// Interpolation — dynamic values in strings
// en: "Hello, {{name}}! You have {{count}} agents."
t('dashboard.greeting', { name: user.name, count: agents.length })

// Pluralization — i18next uses _one / _other suffixes
// en/translation.json:
// { "agents": { "count_one": "{{count}} agent", "count_other": "{{count}} agents" } }
t('agents.count', { count: agents.length })
```

Never concatenate strings with `+` or template literals to build user-facing text — always use interpolation keys.

## Adding a New Language

1. Create `public/locales/<lang-code>/translation.json` (e.g., `fr`, `de`, `ar`, `zh`).
2. Copy the entire `en/translation.json` structure.
3. Translate every value — replace all `"TODO: translate"` entries.
4. Add the language code to `supportedLngs` in `src/lib/i18n.ts`:
   ```ts
   supportedLngs: ['en', 'ar', 'fr', /* add here */],
   ```
5. Add the option to `LanguageSwitcher.tsx`:
   ```tsx
   const LANGUAGES = [
     { code: 'en', label: 'English' },
     { code: 'ar', label: 'العربية' },
     { code: 'fr', label: 'Français' },
     // add here
   ];
   ```
6. For RTL languages (Arabic, Hebrew, Urdu), add `dir="rtl"` logic in `app/layout.tsx`.

## Verification Checklist

- [ ] No hardcoded user-visible strings remain in the component after the change.
- [ ] All new keys added to **every** locale file (with `"TODO: translate"` placeholders where needed).
- [ ] Key names follow `feature.component.element` convention (max 4 levels).
- [ ] Dynamic values use `{{ }}` interpolation — no string concatenation.
- [ ] Pluralization uses `_one`/`_other` key suffixes — no manual ternaries.
- [ ] New language added to `supportedLngs` in `i18n.ts` and to `LanguageSwitcher`.
