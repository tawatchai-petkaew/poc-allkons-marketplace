'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { IconWithRing } from '../IconWithRing';
import type { IconWithRingVariant } from '../IconWithRing';
import { EmptyIllustration } from './EmptyIllustration';
import type { EmptyIllustrationType, EmptyIllustrationColor } from './EmptyIllustration';

export type { EmptyIllustrationType, EmptyIllustrationColor };

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: EmptyState — node 40001811:16517
//
// Sizes:  sm (illustration 160px) | md (200px) | lg (200px)
// Modes:  illustration (EmptyIllustration) | feature-icon (IconWithRing)
// Layout: centered column — icon → text → actions

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps {
  /** Size variant — controls illustration size and text scale */
  size?: EmptyStateSize;

  // ── Illustration mode (default) ──────────────────────────────────────────
  /** Illustration variant 01/02/03 */
  illustrationType?: EmptyIllustrationType;
  /** Color theme for the illustration */
  illustrationColor?: EmptyIllustrationColor;

  // ── Feature icon mode ────────────────────────────────────────────────────
  /** When provided, renders an IconWithRing instead of EmptyIllustration */
  featureIcon?: ReactNode;
  /** Color variant for the IconWithRing (default: 'brand') */
  featureIconVariant?: IconWithRingVariant;

  // ── Content ──────────────────────────────────────────────────────────────
  /** Primary heading */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Action buttons slot — typically secondary-neutral + primary-brand Button pair */
  actions?: ReactNode;

  className?: string;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export const EmptyState = ({
  size = 'md',
  illustrationType = '01',
  illustrationColor = 'neutral',
  featureIcon,
  featureIconVariant = 'brand',
  title,
  description,
  actions,
  className,
}: EmptyStateProps) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 160 : 200;

  return (
    <div
      className={clsx(
        'flex flex-col items-center text-center w-full',
        isSm ? 'gap-4' : 'gap-6',
        className,
      )}
    >
      {/* Icon — Feature icon (IconWithRing) or Illustration */}
      {featureIcon ? (
        <IconWithRing
          variant={featureIconVariant}
          icon={featureIcon}
          size={iconSize}
        />
      ) : (
        <EmptyIllustration
          type={illustrationType}
          color={illustrationColor}
          size={iconSize}
        />
      )}

      {/* Text content */}
      <div className={clsx('flex flex-col', isSm ? 'gap-1' : 'gap-2')}>
        <h3
          className={clsx(
            'font-medium text-text-secondary',
            isSm ? 'text-base leading-6' : 'text-lg leading-7',
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={clsx(
              'text-text-quaternary',
              isSm ? 'text-sm leading-5' : 'text-base leading-6',
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {actions}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
