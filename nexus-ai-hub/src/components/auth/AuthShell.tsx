'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RootState } from '@/store';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthForm from '@/components/auth/AuthForm';

type Mode = 'signin' | 'signup';

function safeNext(next: string | null) {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//')) return '/';
  return next;
}

export default function AuthShell({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextHref = safeNext(searchParams.get('next'));

  const user = useSelector((s: RootState) => s.auth.user);
  const isMember = Boolean(user && !user.guestMode);

  useEffect(() => {
    // Real account only — guests may open login to sign in.
    if (isMember) router.replace(nextHref);
  }, [isMember, nextHref, router]);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <AuthLeftPanel mode={mode} />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-[520px] bg-white border border-black/[0.08] shadow-card rounded-[24px] p-6 sm:p-8">
          <AuthForm mode={mode} />
        </div>
      </div>
    </div>
  );
}

