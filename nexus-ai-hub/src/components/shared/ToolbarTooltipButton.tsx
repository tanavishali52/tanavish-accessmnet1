'use client';

import type { ReactNode } from 'react';

type Props = {
  tooltip: string;
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function ToolbarTooltipButton({ tooltip, children, className = '', ...rest }: Props) {
  return (
    <span className="relative inline-flex group">
      <button type="button" className={className} {...rest}>
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 cursor-default select-none rounded-full bg-neutral-900 px-2.5 py-1 text-[0.7rem] font-semibold leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 whitespace-nowrap"
        onPointerDown={(e) => e.preventDefault()}
      >
        {tooltip}
      </span>
    </span>
  );
}
