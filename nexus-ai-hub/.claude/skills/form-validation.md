---
description: Implements consistent form validation in NexusAI Hub. Use when tasks involve field-level validation, error messages, submission state, or wiring forms to Redux auth/agent state.
---

# Form Validation Skill

## Use This Skill When

- Adding a new form (login, signup, agent builder fields, settings).
- Adding field-level validation to an existing form.
- Wiring form submission to a Redux action with loading/error feedback.
- Displaying server-side validation errors from the backend.

## State Shape

```tsx
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const [form, setForm] = useState<FormState>({
  values: { email: '', password: '' },
  errors: {},
  isSubmitting: false,
});
```

## Field Change Handler

```tsx
const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm(prev => ({
    ...prev,
    values: { ...prev.values, [field]: e.target.value },
    errors: { ...prev.errors, [field]: '' }, // clear error on change
  }));
};
```

## Validation Function

```tsx
function validate(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.email?.trim()) {
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

## Submit Handler

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validate(form.values);
  if (Object.keys(errors).length > 0) {
    setForm(prev => ({ ...prev, errors }));
    return;
  }
  setForm(prev => ({ ...prev, isSubmitting: true }));
  try {
    await dispatch(loginAction(form.values));
  } catch (err) {
    setForm(prev => ({
      ...prev,
      isSubmitting: false,
      errors: { form: err instanceof Error ? err.message : 'Something went wrong' },
    }));
  }
};
```

## Input & Error Rendering

```tsx
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="text-sm text-text2">{t('auth.form.email.label')}</label>
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

{/* Form-level server error */}
{form.errors.form && (
  <p role="alert" className="text-sm text-red-500 text-center">{form.errors.form}</p>
)}

{/* Submit button */}
<button type="submit" disabled={form.isSubmitting}
  className="w-full rounded-lg bg-accent text-white py-2 text-sm disabled:opacity-50">
  {form.isSubmitting ? t('auth.form.submitting') : t('auth.form.submit')}
</button>
```

## AgentBuilder Step Validation

```tsx
function validateStep(step: number, draft: AgentDraft): string | null {
  if (step === 1 && !draft.name?.trim()) return 'Agent name is required';
  if (step === 1 && (draft.name?.length ?? 0) < 2) return 'Name must be at least 2 characters';
  if (step === 3 && !draft.systemPrompt?.trim()) return 'System prompt is required';
  if (step === 3 && (draft.systemPrompt?.length ?? 0) > 2000) return 'System prompt must be under 2000 characters';
  return null;
}

const error = validateStep(currentStep, draft);
if (error) { dispatch(showToast(error)); return; }
dispatch(setBuilderStep(currentStep + 1));
```

## Verification Checklist

- [ ] Validation runs client-side before any API call.
- [ ] Errors are cleared per-field when the user starts typing.
- [ ] Server errors are displayed as form-level messages with `role="alert"`.
- [ ] Submit button is `disabled` while `isSubmitting` is true.
- [ ] Error elements use `aria-describedby` linked to the input.
- [ ] All visible strings go through `t()` from `useTranslation()`.
