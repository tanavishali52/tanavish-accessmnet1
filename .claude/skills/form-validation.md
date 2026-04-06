---
description: Implements consistent form validation in NexusAI Hub. Use when tasks involve adding field-level validation, displaying error messages, handling submission states, or wiring form inputs to Redux auth/agent state.
---

# Form Validation Skill

## Use This Skill When

- Adding a new form (login, signup, agent builder fields, chat settings).
- Adding field-level validation to an existing form.
- Wiring form submission to a Redux action with loading/error feedback.
- Displaying server-side validation errors from the backend response.

## Validation Pattern

NexusAI uses controlled components with local validation state — no external form library. Follow this pattern consistently:

### State Shape

```tsx
interface FormState {
  values: { [field: string]: string };
  errors: { [field: string]: string };
  isSubmitting: boolean;
}

const [form, setForm] = useState<FormState>({
  values: { email: '', password: '' },
  errors: {},
  isSubmitting: false,
});
```

### Field Change Handler

```tsx
const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm(prev => ({
    ...prev,
    values: { ...prev.values, [field]: e.target.value },
    errors: { ...prev.errors, [field]: '' }, // clear error on change
  }));
};
```

### Validation Function

Write a pure validation function that returns an errors object. An empty object means valid:

```tsx
function validate(values: FormState['values']): FormState['errors'] {
  const errors: FormState['errors'] = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
}
```

### Submit Handler

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Client-side validation
  const errors = validate(form.values);
  if (Object.keys(errors).length > 0) {
    setForm(prev => ({ ...prev, errors }));
    return;
  }

  // 2. Submit
  setForm(prev => ({ ...prev, isSubmitting: true }));
  try {
    await dispatch(loginAction(form.values));
  } catch (err) {
    // 3. Server error — show as a form-level error
    setForm(prev => ({
      ...prev,
      isSubmitting: false,
      errors: { form: err instanceof Error ? err.message : 'Something went wrong' },
    }));
  }
};
```

### Input & Error Rendering

```tsx
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="text-sm text-text2">
    {t('auth.form.email.label')}
  </label>
  <input
    id="email"
    type="email"
    value={form.values.email}
    onChange={handleChange('email')}
    aria-describedby={form.errors.email ? 'email-error' : undefined}
    aria-invalid={!!form.errors.email}
    className={`rounded-lg border px-3 py-2 text-sm bg-bg text-text1
      ${form.errors.email ? 'border-red-500' : 'border-bg2'}`}
  />
  {form.errors.email && (
    <span id="email-error" role="alert" className="text-xs text-red-500">
      {form.errors.email}
    </span>
  )}
</div>

{/* Form-level error (server errors) */}
{form.errors.form && (
  <p role="alert" className="text-sm text-red-500 text-center">
    {form.errors.form}
  </p>
)}

{/* Submit button */}
<button
  type="submit"
  disabled={form.isSubmitting}
  className="w-full rounded-lg bg-accent text-white py-2 text-sm
    disabled:opacity-50 disabled:cursor-not-allowed"
>
  {form.isSubmitting ? t('auth.form.submitting') : t('auth.form.submit')}
</button>
```

## Agent Builder Field Validation

For multi-step builder forms (AgentBuilder), validate per step before advancing:

```tsx
function validateStep(step: number, draft: AgentDraft): string | null {
  switch (step) {
    case 1: // Configure
      if (!draft.name?.trim()) return 'Agent name is required';
      if (draft.name.length < 2) return 'Name must be at least 2 characters';
      return null;
    case 3: // System Prompt
      if (!draft.systemPrompt?.trim()) return 'System prompt is required';
      if (draft.systemPrompt.length > 2000) return 'System prompt must be under 2000 characters';
      return null;
    default:
      return null;
  }
}

// Before advancing to next step
const error = validateStep(currentStep, draft);
if (error) { showToast(error); return; }
dispatch(setBuilderStep(currentStep + 1));
```

## Verification Checklist

- [ ] Validation runs client-side before any API call is made.
- [ ] Errors are cleared per-field when the user starts typing.
- [ ] Server errors (from Redux `error` state) are displayed as a form-level message.
- [ ] Submit button is `disabled` while `isSubmitting` is true.
- [ ] Error messages use `role="alert"` and are linked via `aria-describedby`.
- [ ] All form labels are present and linked to inputs via `htmlFor`/`id`.
- [ ] All visible strings use `t()` from `useTranslation()`.
