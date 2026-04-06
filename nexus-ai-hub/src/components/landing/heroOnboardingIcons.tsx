'use client';

import { CatalogIcon } from '@/components/shared/CatalogIcon';

/** Renders a Feather icon by export name from hero-onboarding API data (`FiZap`, etc.). */
export function HeroOnboardIcon({
  name,
  className,
  size = 16,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  return <CatalogIcon name={name} size={size} strokeWidth={2} className={`text-accent ${className ?? ''}`} />;
}
