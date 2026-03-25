'use client';

import { type ReactNode, type ElementType } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Typography tokens — Allkons DS1

export type TypographyVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'paragraph-big' | 'paragraph-medium' | 'paragraph-small' | 'paragraph-extra-small'
  | 'label-big' | 'label-medium' | 'label-small'
  | 'caption';

export interface TypographyProps {
  variant?: TypographyVariant;
  /** Override the rendered HTML element. Defaults to semantic match (h1–h6, p, span). */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

// ─── Variant → Tailwind classes ───────────────────────────────────────────────

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  'h1':                    'text-4xl font-semibold leading-tight',
  'h2':                    'text-3xl font-semibold leading-tight',
  'h3':                    'text-2xl font-semibold leading-tight',
  'h4':                    'text-xl  font-semibold leading-snug',
  'h5':                    'text-lg  font-semibold leading-snug',
  'h6':                    'text-base font-semibold leading-normal',
  'paragraph-big':         'text-base leading-relaxed',
  'paragraph-medium':      'text-sm  leading-relaxed',
  'paragraph-small':       'text-xs  leading-normal',
  'paragraph-extra-small': 'text-[10px] leading-normal',
  'label-big':             'text-sm  font-medium leading-normal',
  'label-medium':          'text-xs  font-medium leading-normal',
  'label-small':           'text-[10px] font-medium leading-normal',
  'caption':               'text-[10px] leading-tight',
};

// ─── Default element per variant ──────────────────────────────────────────────

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  'paragraph-big':         'p',
  'paragraph-medium':      'p',
  'paragraph-small':       'p',
  'paragraph-extra-small': 'p',
  'label-big':             'span',
  'label-medium':          'span',
  'label-small':           'span',
  'caption':               'span',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Typography = ({
  variant = 'paragraph-medium',
  as,
  className,
  children,
  ...rest
}: TypographyProps) => {
  const Tag = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Tag className={clsx(VARIANT_CLASSES[variant], className)} {...rest}>
      {children}
    </Tag>
  );
};
