'use client';

import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: ProgressBar — node 40007892:6022
// Track  = 8px h, rounded-full, bg-background-secondary (#F7F8F9)
// Fill   = bg-primary (#00AF43), min 8px dot when value=0
// Label  = none | right | bottom (percentage text, text-text-secondary)

export type ProgressLabelPosition = 'none' | 'right' | 'bottom';

export interface ProgressBarProps {
  /** 0–100. Values outside this range are clamped. Default: 0 */
  value?: number;
  /** Percentage label position. Default: none */
  label?: ProgressLabelPosition;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProgressBar = ({
  value    = 0,
  label    = 'none',
  className,
}: ProgressBarProps) => {
  const pct = Math.min(100, Math.max(0, value));
  const labelText = `${Math.round(pct)}%`;

  // ── Track + fill ───────────────────────────────────────────────────────────
  // At 0% Figma shows an 8×8 dot (same height as track) — achieved via min-w-[8px]
  // on the fill with overflow-hidden on the track containing it.
  const track = (
    <div
      className={clsx(
        'relative h-2 overflow-hidden rounded-full bg-background-secondary',
        // In right-label layout, the track must flex-grow to fill remaining width
        label === 'right' ? 'flex-1 min-w-0' : 'w-full',
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-in-out"
        style={{ width: pct === 0 ? '8px' : `${pct}%` }}
      />
    </div>
  );

  // ── Label: Right ───────────────────────────────────────────────────────────
  if (label === 'right') {
    return (
      <div className={clsx('flex items-center gap-3', className)}>
        {track}
        <span className="shrink-0 text-xs leading-4 text-text-secondary whitespace-nowrap">
          {labelText}
        </span>
      </div>
    );
  }

  // ── Label: Bottom ──────────────────────────────────────────────────────────
  if (label === 'bottom') {
    return (
      <div className={clsx('flex flex-col gap-2', className)}>
        {track}
        <span className="self-end text-xs leading-4 text-text-secondary whitespace-nowrap">
          {labelText}
        </span>
      </div>
    );
  }

  // ── No label ───────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {track}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
