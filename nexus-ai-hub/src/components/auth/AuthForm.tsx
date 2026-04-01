'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const nextHref = useMemo(() => safeNext(searchParams.get('next')), [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const title = mode === 'signin' ? 'Sign in' : 'Create your account';
  const subtitle = mode === 'signin'
    ? 'Welcome back — pick up where you left off.'
    : 'Join the hub and unlock saved chats & agents.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      dispatch((mode === 'signin' ? loginFailure : signupFailure)('Please enter a valid email.'));
      return;
    }
    if (password.trim().length < 6) {
      dispatch((mode === 'signin' ? loginFailure : signupFailure)('Password must be at least 6 characters.'));
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      dispatch(signupFailure('Please enter your name.'));
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
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
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
            <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
            placeholder="you@company.com"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <label className="block text-[0.8rem] text-text2 font-medium font-instrument mb-1.5">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/[0.14] bg-white px-4 py-3 text-[0.9rem] outline-none focus:border-accent focus:shadow-[0_0_0_4px_rgba(200,98,42,0.10)] font-instrument"
            placeholder="••••••••"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-white text-[0.9rem] font-medium rounded-full px-5 py-3 hover:bg-accent2 transition-colors cursor-pointer font-instrument border-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
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

