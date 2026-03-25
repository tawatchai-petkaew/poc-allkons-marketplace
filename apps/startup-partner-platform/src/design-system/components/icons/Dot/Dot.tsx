'use client';

import React from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DotSize = 'xs' | 'sm' | 'md' | 'lg';

export interface DotProps {
  /** Active (green) or inactive (gray) state */
  active?: boolean;
  /** Dot diameter — xs=6px | sm=8px | md=10px | lg=12px */
  size?: DotSize;
  className?: string;
}

// ─── Size map (Figma: Dot) ────────────────────────────────────────────────────

const sizeClass: Record<DotSize, string> = {
  xs: 'w-[6px] h-[6px]',
  sm: 'w-[8px] h-[8px]',
  md: 'w-[10px] h-[10px]',
  lg: 'w-[12px] h-[12px]',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Dot = ({ active = true, size = 'lg', className }: DotProps) => (
  <span
    role="status"
    aria-label={active ? 'active' : 'inactive'}
    className={clsx(
      'inline-block shrink-0 rounded-full',
      sizeClass[size],
      active ? 'bg-primary' : 'bg-neutral-p60',
      className
    )}
  />
);

Dot.displayName = 'Dot';
