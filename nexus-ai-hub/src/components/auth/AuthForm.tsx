'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { RootState } from '@/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  clearError,
  AuthUser,
} from '@/store/authSlice';
import { apiLogin, apiSignup } from '@/lib/api';

type Mode = 'signin' | 'signup';

function safeNext(next: string | null) {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/';
  // Avoid protocol-relative urls.
  if (next.startsWith('//')) return '/';
  return next;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const nextHref = useMemo(() => safeNext(searchParams.get('next')), [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const title = mode === 'signin' ? t('auth.form.signin_title') : t('auth.form.signup_title');
  const subtitle = mode === 'signin'
    ? t('auth.form.signin_subtitle')
    : t('auth.form.signup_subtitle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      dispatch((mode === 'signin' ? loginFailure : signupFailure)(t('auth.validation.email')));
      return;
    }
    if (password.trim().length < 6) {
      dispatch((mode === 'signin' ? loginFailure : signupFailure)(t('auth.validation.password_min')));
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      dispatch(signupFailure(t('auth.validation.name')));
      return;
    }

    try {
      if (mode === 'signin') dispatch(loginStart());
      else dispatch(signupStart());

      const result = mode === 'signin'
        ? await apiLogin(cleanEmail, password.trim())
        : await apiSignup(name.trim(), cleanEmail, password.trim());

      const user: AuthUser = {
        id: result.id,
        name: result.name,
        email: result.email,
        avatar: result.name[0]?.toUpperCase() ?? 'U',
        plan: result.plan,
      };

      if (mode === 'signin') dispatch(loginSuccess(user));
      else dispatch(signupSuccess(user));

      router.replace(nextHref);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.error.generic');
      dispatch((mode === 'signin' ? loginFailure : signupFailure)(message));
    }
  };

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-7">
        <h1 className="font-syne text-[1.8rem] sm:text-[2rem] font-bold text-text1" style={{ letterSpacing: '-0.04em' }}>
          {title}
        </h1>
        <p className="text-text2 text-[0.9rem] font-instrument mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700 font-instrument">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">{t('auth.form.labels.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
              placeholder={t('auth.form.placeholders.name')}
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">{t('auth.form.labels.email')}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
            placeholder={t('auth.form.placeholders.email')}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">{t('auth.form.labels.password')}</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
            placeholder={t('auth.form.placeholders.password')}
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-white text-[0.9rem] font-medium rounded-full px-5 py-3 hover:bg-accent2 transition-colors cursor-pointer font-instrument border-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? t('auth.form.buttons.wait') : mode === 'signin' ? t('auth.form.buttons.signin') : t('auth.form.buttons.signup')}
        </button>
      </form>

      <div className="mt-5 text-[0.85rem] text-text2 font-instrument">
        {mode === 'signin' ? (
          <span>
            New here?{' '}
            <button onClick={() => router.push(`/signup?next=${encodeURIComponent(nextHref)}`)} className="text-accent hover:text-accent2 font-medium">
              Create an account
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button onClick={() => router.push(`/login?next=${encodeURIComponent(nextHref)}`)} className="text-accent hover:text-accent2 font-medium">
              Sign in
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

