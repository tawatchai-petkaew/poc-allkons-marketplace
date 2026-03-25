'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Illustration } from '../Illustration';
import type { IllustrationType } from '../Illustration';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Icon with Ring — node 40008948:10905

export type IconWithRingVariant = 'gray' | 'success' | 'brand' | 'error' | 'info' | 'warning';

export interface IconWithRingProps {
  /** Color variant — maps to semantic token group */
  variant?: IconWithRingVariant;
  /** Fill disc with subtle gradient (true) or transparent (false). Default: true */
  bg?: boolean;
  /** Icon to render in the center — accepts any ReactNode (from any icon library) */
  icon?: ReactNode;
  /** Illustration to render in the center (overrides `icon` when both provided) */
  illustration?: IllustrationType;
  /** Show loading spinner in the center (highest priority) */
  loading?: boolean;
  /** Container size in px (default 160) */
  size?: number;
  className?: string;
}

// ─── Variant config ───────────────────────────────────────────────────────────
// Exact values extracted from Figma SVG exports (240px reference frame)
//
// ring:       stroke color for all 5 concentric circles + icon default color
// gradTop:    gradient stop-0 (top of disc) — used when bg=true
// gradBottom: gradient stop-1 (bottom of disc) — used when bg=true

const VARIANT_CONFIG: Record<IconWithRingVariant, {
  ring: string;
  gradTop: string;
  gradBottom: string;
  /** CSS filter chain: converts image to black then tints to ring color */
  illustrationFilter: string;
}> = {
  // filter = brightness(0) saturate(100%) → colorize to ring hex
  gray:    {
    ring: '#5B6A83', gradTop: '#9DA6B5', gradBottom: '#F7F8F9',
    illustrationFilter: 'brightness(0) saturate(100%) invert(41%) sepia(15%) saturate(500%) hue-rotate(185deg) brightness(95%)',
  },
  success: {
    ring: '#1EB950', gradTop: '#83D99F', gradBottom: '#E8F8ED',
    illustrationFilter: 'brightness(0) saturate(100%) invert(55%) sepia(75%) saturate(700%) hue-rotate(95deg) brightness(92%)',
  },
  brand:   {
    ring: '#00AF43', gradTop: '#66CF8E', gradBottom: '#E5F7EC',
    illustrationFilter: 'brightness(0) saturate(100%) invert(46%) sepia(98%) saturate(900%) hue-rotate(115deg) brightness(88%)',
  },
  error:   {
    ring: '#DA2110', gradTop: '#E8796F', gradBottom: '#FBE8E7',
    illustrationFilter: 'brightness(0) saturate(100%) invert(20%) sepia(97%) saturate(3500%) hue-rotate(350deg) brightness(88%)',
  },
  info:    {
    ring: '#65B2E8', gradTop: '#A2D0F1', gradBottom: '#EFF7FC',
    illustrationFilter: 'brightness(0) saturate(100%) invert(69%) sepia(40%) saturate(500%) hue-rotate(178deg) brightness(108%)',
  },
  warning: {
    ring: '#FFAB08', gradTop: '#FFCD6B', gradBottom: '#FFF7E6',
    illustrationFilter: 'brightness(0) saturate(100%) invert(72%) sepia(90%) saturate(2000%) hue-rotate(5deg) brightness(112%)',
  },
};

// ─── Ring geometry (from Figma SVG, 240px reference, radius=120px) ────────────
//
//  Ring │ radius (px) │ ratio of r=120  │ opacity
//  ─────┼─────────────┼─────────────────┼────────
//    1  │  45.9038    │  0.38253        │  0.25
//    2  │  64.3654    │  0.53638        │  0.20
//    3  │  82.8269    │  0.69022        │  0.15
//    4  │ 101.2886    │  0.84407        │  0.10
//    5  │ 119.7500    │  0.99792        │  0.05
//
//  stroke-width = 0.5px at 240px → scale = size / 480

const RINGS = [
  { ratio: 0.38253, opacity: 0.25 },
  { ratio: 0.53638, opacity: 0.20 },
  { ratio: 0.69022, opacity: 0.15 },
  { ratio: 0.84407, opacity: 0.10 },
  { ratio: 0.99792, opacity: 0.05 },
] as const;

// Content zone: 46.666px at 240px → 19.44% of container size
const CONTENT_RATIO = 0.1944;

// ─── Ring SVG ─────────────────────────────────────────────────────────────────

const RingSvg = ({ size, color }: { size: number; color: string }) => {
  const cx = size / 2;
  const strokeWidth = size / 480;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    >
      {RINGS.map(({ ratio, opacity }) => (
        <circle
          key={ratio}
          cx={cx}
          cy={cx}
          r={cx * ratio}
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      ))}
    </svg>
  );
};

// ─── Loading spinner ──────────────────────────────────────────────────────────

const Spinner = ({ color, size }: { color: string; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
    style={{ color }}
    aria-label="Loading"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const IconWithRing = ({
  variant = 'brand',
  bg = true,
  icon,
  illustration,
  loading = false,
  size = 160,
  className,
}: IconWithRingProps) => {
  const { ring, gradTop, gradBottom, illustrationFilter } = VARIANT_CONFIG[variant];

  // Icon/spinner zone (Figma: 46.666px @ 240px)
  const contentSize = Math.round(size * CONTENT_RATIO);
  // Illustrations extend a bit beyond the icon zone for visual balance
  const illustrationSize = Math.round(size * 0.32);

  const gradientId = `ikr-grad-${variant}`;

  return (
    <div
      className={clsx('relative shrink-0 rounded-full overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      {/* Gradient background disc (bg=true only) */}
      {bg && (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          aria-hidden
          className="absolute inset-0 pointer-events-none"
        >
          <defs>
            <linearGradient id={gradientId} x1={size / 2} y1="0" x2={size / 2} y2={size} gradientUnits="userSpaceOnUse">
              <stop stopColor={gradTop} />
              <stop offset="1" stopColor={gradBottom} />
            </linearGradient>
          </defs>
          <ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 2} fill={`url(#${gradientId})`} fillOpacity="0.05" />
        </svg>
      )}

      {/* Concentric rings */}
      <RingSvg size={size} color={ring} />

      {/* Content */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: ring }}
      >
        {loading ? (
          <Spinner color={ring} size={contentSize} />
        ) : illustration ? (
          <div style={{ filter: illustrationFilter }}>
            <Illustration type={illustration} size={illustrationSize} />
          </div>
        ) : icon ? (
          <span
            className="inline-flex items-center justify-center"
            style={{ width: contentSize, height: contentSize }}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
};

IconWithRing.displayName = 'IconWithRing';
