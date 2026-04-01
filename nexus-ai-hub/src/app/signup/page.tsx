import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';

export default function SignupPage() {
  return (
    <Suspense>
      <AuthShell mode="signup" />
    </Suspense>
  );
}

