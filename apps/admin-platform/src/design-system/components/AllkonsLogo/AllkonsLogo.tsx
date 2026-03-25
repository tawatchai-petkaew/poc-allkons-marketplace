'use client';

import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Logo/Company — pre-exported SVGs per theme × size × variant

export type AllkonsLogoTheme = 'default' | 'dark' | 'light';
export type AllkonsLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * icon    — logo mark (people icon only)
 * text    — wordmark only
 * full    — icon + "allkons" wordmark
 * mseller — icon + "allkons m seller" wordmark
 */
export type AllkonsLogoVariant = 'icon' | 'text' | 'full' | 'mseller';

export interface AllkonsLogoProps {
  /** Color theme — Default / Dark / Light */
  theme?: AllkonsLogoTheme;
  /** Size token */
  size?: AllkonsLogoSize;
  /** Which logo variant to show */
  variant?: AllkonsLogoVariant;
  className?: string;
  /** Accessible label */
  alt?: string;
}

// ─── Intrinsic sizes (px) from Figma ─────────────────────────────────────────
// Logo mark (icon / text)

const ICON_SIZES: Record<AllkonsLogoSize, number> = {
  xs: 16, sm: 20, md: 24, lg: 32, xl: 40,
};

const TEXT_SIZES: Record<AllkonsLogoSize, { w: number; h: number }> = {
  xs: { w: 108.8, h: 16 },
  sm: { w: 136,   h: 20 },
  md: { w: 163.2, h: 24 },
  lg: { w: 217.6, h: 32 },
  xl: { w: 272,   h: 40 },
};

// Full logo (full / mseller) — from Figma Logo/Company frame
const FULL_SIZES: Record<AllkonsLogoSize, { w: number; h: number }> = {
  xs: { w: 142.5,  h: 24 },
  sm: { w: 166.25, h: 28 },
  md: { w: 190,    h: 32 },
  lg: { w: 237.5,  h: 40 },
  xl: { w: 230,    h: 48 },
};

// M Seller logo sizes — from Figma Logo/Company frame (Unit=M Seller)
const MSELLER_SIZES: Record<AllkonsLogoSize, { w: number; h: number }> = {
  xs: { w: 108,  h: 24 },
  sm: { w: 126,  h: 28 },
  md: { w: 144,  h: 32 },
  lg: { w: 180,  h: 40 },
  xl: { w: 216,  h: 48 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AllkonsLogo = ({
  theme = 'default',
  size = 'xl',
  variant = 'full',
  className,
  alt = 'Allkons',
}: AllkonsLogoProps) => {
  const src = `/images/logo/${variant}/${theme}-${size}.svg`;

  if (variant === 'icon') {
    const s = ICON_SIZES[size];
    return (
      <div
        className={clsx('relative shrink-0', className)}
        style={{ width: s, height: s }}
        role="img"
        aria-label={alt}
        title={alt}
      >
        <Image src={src} alt={alt} fill className="object-contain" sizes={`${s}px`} />
      </div>
    );
  }

  if (variant === 'text') {
    const { w, h } = TEXT_SIZES[size];
    return (
      <div
        className={clsx('relative shrink-0', className)}
        style={{ width: w, height: h }}
        role="img"
        aria-label={alt}
      >
        <Image src={src} alt={alt} fill className="object-contain object-left" sizes={`${Math.round(w)}px`} />
      </div>
    );
  }

  const { w, h } = variant === 'mseller' ? MSELLER_SIZES[size] : FULL_SIZES[size];
  return (
    <div
      className={clsx('relative shrink-0', className)}
      style={{ width: w, height: h }}
      role="img"
      aria-label={alt}
    >
      <Image src={src} alt={alt} fill className="object-contain object-left" sizes={`${Math.round(w)}px`} />
    </div>
  );
};

AllkonsLogo.displayName = 'AllkonsLogo';
