'use client';

import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: EmptyIllustration — node 40001811:4148
//
// 3 illustration types × 2 color variants, 240×240px reference size
// Assets: /images/illustrations/empty-{type}-{color}.svg
//
// Each type has different insets (top right bottom left) as % of container size,
// matching Figma's inner Group positioning.

export type EmptyIllustrationType = '01' | '02' | '03';
export type EmptyIllustrationColor = 'neutral' | 'gradient';

export interface EmptyIllustrationProps {
  /** Illustration variant (default: '01') */
  type?: EmptyIllustrationType;
  /** Color theme — neutral (light gray) or gradient (darker gradient) */
  color?: EmptyIllustrationColor;
  /** Container size in px (default 240) */
  size?: number;
  alt?: string;
  className?: string;
}

// ─── Inset config (from Figma: top right bottom left as % strings) ────────────

const INSETS: Record<EmptyIllustrationType, { top: string; right: string; bottom: string; left: string }> = {
  '01': { top: '12.08%', right: '6.67%',  bottom: '12.08%', left: '7.08%'  },
  '02': { top: '24.17%', right: '7.5%',   bottom: '24.58%', left: '7.08%'  },
  '03': { top: '8.8%',   right: '15%',    bottom: '8.88%',  left: '14.73%' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const EmptyIllustration = ({
  type = '01',
  color = 'neutral',
  size = 240,
  alt,
  className,
}: EmptyIllustrationProps) => {
  const inset = INSETS[type];

  return (
    <div
      className={clsx('relative overflow-hidden shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute"
        style={{
          top:    inset.top,
          right:  inset.right,
          bottom: inset.bottom,
          left:   inset.left,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/illustrations/empty-${type}-${color}.svg`}
          alt={alt ?? `Empty state illustration ${type}`}
          className="block w-full h-full"
        />
      </div>
    </div>
  );
};

EmptyIllustration.displayName = 'EmptyIllustration';
