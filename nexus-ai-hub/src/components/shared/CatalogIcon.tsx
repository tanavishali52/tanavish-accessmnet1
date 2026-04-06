'use client';

import type { ComponentType, SVGProps } from 'react';
import * as Fi from 'react-icons/fi';
import * as Md from 'react-icons/md';
import * as Gi from 'react-icons/gi';

export type SvgIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: string | number; strokeWidth?: string | number }
>;

const fi = Fi as unknown as Record<string, SvgIcon>;
const md = Md as unknown as Record<string, SvgIcon>;
const gi = Gi as unknown as Record<string, SvgIcon>;

export function resolveCatalogIcon(name: string | undefined | null): SvgIcon | null {
  if (!name || typeof name !== 'string') return null;
  const key = name.trim();
  if (!key) return null;
  return fi[key] ?? md[key] ?? gi[key] ?? null;
}

export function CatalogIcon({
  name,
  className,
  size = 16,
  strokeWidth = 2,
}: {
  name: string | undefined | null;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = resolveCatalogIcon(name);
  if (!Icon) {
    const Fallback = Fi.FiHelpCircle;
    return (
      <Fallback
        className={`inline-flex shrink-0 opacity-45 ${className ?? ''}`}
        size={size}
        strokeWidth={strokeWidth}
        aria-hidden
      />
    );
  }
  return (
    <Icon
      className={`inline-flex shrink-0 ${className ?? ''}`}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}
