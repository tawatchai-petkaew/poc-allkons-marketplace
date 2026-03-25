'use client';

import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Illustration/Graphic — 38 illustrations available, 160×160px

export type IllustrationType =
  // E-commerce (18)
  | 'cart' | 'cart-plus' | 'cart-search'
  | 'shopping-bag-1' | 'shopping-bag-2' | 'shopping-bag-heart'
  | 'store' | 'store-heart' | 'store-search'
  | 'credit-card' | 'credit-card-chart-01' | 'credit-card-chart-02'
  | 'credit-check' | 'bill-check' | 'bill-clock' | 'arrow-bill' | 'qr-bill' | 'car-clock'
  // Location / Map (3)
  | 'location' | 'add-location' | 'map-pin'
  // Documents (3)
  | 'docs-boq' | 'docs-boq-check' | 'docs-check'
  // App / Tools (9)
  | 'app' | 'app-dual' | 'app-dual-with-ai' | 'paint-brush' | 'image'
  | 'compare' | 'add-compare' | 'chat-search' | 'category'
  // Users (2)
  | 'user-group' | 'users-setting'
  // System / Misc (3)
  | 'server' | 'cloud-off' | 'cookie';

export interface IllustrationProps {
  /** Illustration type — maps to /images/illustrations/{type}.svg */
  type: IllustrationType;
  /** Width in px (default 160 — Figma intrinsic size) */
  size?: number;
  alt?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Figma: Illustration/Graphic — 160×160px square

export const Illustration = ({
  type,
  size = 160,
  alt,
  className,
}: IllustrationProps) => (
  <div
    className={clsx('relative shrink-0', className)}
    style={{ width: size, height: size }}
  >
    <Image
      src={`/images/illustrations/${type}.svg`}
      alt={alt ?? type.replace(/-/g, ' ')}
      fill
      className="object-contain"
      sizes={`${size}px`}
    />
  </div>
);

Illustration.displayName = 'Illustration';
