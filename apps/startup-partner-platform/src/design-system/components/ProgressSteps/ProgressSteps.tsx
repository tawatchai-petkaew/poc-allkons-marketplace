'use client';

import { type ReactNode, Fragment } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: StepIcon       — node 40008812:7637
//        NavStep item   — node 40008853:6712  (horizontal compact nav bar)
//        Step item      — node 40008853:6743  (full step with connector lines)
//        ProgressSteps  — node 40008856:12016
//
// Status = finished | current | in-progress | waiting | error
// Type   = default (dot/check) | number | icon (custom ReactNode)
// Layout = horizontal (compact nav bar) | vertical (centered-icon wizard)
// Size   = sm | md | lg  (lg not available in horizontal layout)

export type StepStatus = 'finished' | 'current' | 'in-progress' | 'waiting' | 'error';
export type StepType   = 'default' | 'number' | 'icon';
export type StepLayout = 'horizontal' | 'vertical';
export type StepSize   = 'sm' | 'md' | 'lg';

export interface StepDef {
  title: string;
  description?: string;
  /** Custom icon ReactNode — used when type='icon' */
  icon?: ReactNode;
  /** Override auto-derived status (useful for error states) */
  status?: StepStatus;
}

export interface ProgressStepsProps {
  steps: StepDef[];
  /**
   * 0-based index of the active step.
   * Automatically derives: index < current → finished, index = current → current, rest → waiting.
   * Per-step `status` override takes precedence.
   * Default: 0
   */
  current?: number;
  /** Icon size. Default: md */
  size?: StepSize;
  /** Content type shown inside the step circle. Default: default */
  type?: StepType;
  /**
   * horizontal — compact navigation bar (icon+text inline, chevron separators, active bottom border).
   * vertical   — wizard-style (icon centered with connector lines, text below).
   * Default: vertical
   */
  layout?: StepLayout;
  /** Render description text. Default: true */
  showDescription?: boolean;
  className?: string;
}

// ─── Internal resolved step ───────────────────────────────────────────────────

interface ResolvedStep extends StepDef {
  index: number;
  resolvedStatus: StepStatus;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

// Step icon circle size
const CIRCLE: Record<StepSize, string> = {
  sm: 'w-6 h-6',    // 24px
  md: 'w-8 h-8',    // 32px
  lg: 'w-16 h-16',  // 64px
};

// Gap between icon and text (horizontal layout)
const NAV_GAP: Record<StepSize, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3',
};

// Step title text
const TITLE: Record<StepLayout, Record<StepSize, string>> = {
  horizontal: {
    sm: 'text-sm font-medium',
    md: 'text-base font-medium',
    lg: 'text-base font-medium',
  },
  vertical: {
    sm: 'text-sm font-medium',
    md: 'text-base font-medium',
    lg: 'text-lg font-medium',  // 18px — Figma Size/lg
  },
};

// Step description text
const DESC: Record<StepSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
};

// Number label inside circle
const NUM: Record<StepSize, string> = {
  sm: 'text-xs font-semibold leading-none',
  md: 'text-base font-semibold leading-none',
  lg: 'text-2xl font-semibold leading-none',
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-full h-full p-[10%]">
    <path d="M4 12.5l5 5 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-full h-full p-[20%]">
    <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ChevronSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function circleClass(status: StepStatus): string {
  switch (status) {
    case 'finished':    return 'bg-primary';
    case 'current':
    case 'in-progress': return 'bg-primary shadow-[0_0_0_3px_#CCEFD9]';
    case 'error':       return 'bg-error';
    case 'waiting':     return 'bg-background-secondary border border-neutral-p60';
  }
}

function titleColor(status: StepStatus, layout: StepLayout): string {
  if (layout === 'horizontal') {
    if (status === 'waiting')  return 'text-text-secondary';
    if (status === 'error')    return 'text-error';
    return 'text-text-primary';
  }
  // vertical
  switch (status) {
    case 'finished':
    case 'current':
    case 'in-progress': return 'text-primary';  // brand green
    case 'error':       return 'text-error';
    case 'waiting':     return 'text-text-secondary';
  }
}

function descColor(status: StepStatus): string {
  return status === 'waiting' || status === 'error' ? 'text-text-quaternary' : 'text-text-tertiary';
}

// ─── Circle content ───────────────────────────────────────────────────────────

const CircleContent = ({
  status,
  type,
  stepNumber,
  icon,
  size,
}: {
  status: StepStatus;
  type: StepType;
  stepNumber: number;
  icon?: ReactNode;
  size: StepSize;
}) => {
  // Finished or Error always show their universal icons regardless of type
  if (status === 'finished') return <CheckSvg />;
  if (status === 'error')    return <CloseSvg />;

  const isWaiting = status === 'waiting';

  // Number type
  if (type === 'number') {
    return (
      <span className={clsx(NUM[size], isWaiting ? 'text-text-placeholder' : 'text-white')}>
        {stepNumber}
      </span>
    );
  }

  // Icon type
  if (type === 'icon' && icon) {
    return (
      <span
        className={clsx(
          'flex items-center justify-center w-[60%] h-[60%]',
          isWaiting ? 'text-text-placeholder' : 'text-white',
          '[&_svg]:w-full [&_svg]:h-full',
        )}
      >
        {icon}
      </span>
    );
  }

  // Default type
  if (isWaiting) {
    // Small gray dot inside gray circle
    return <span className="w-3 h-3 rounded-full bg-neutral-p60" />;
  }
  // Active: white filled circle
  return <span className="w-[45%] h-[45%] rounded-full bg-white" />;
};

// ─── Step circle (icon + optional in-progress ring) ───────────────────────────

const StepCircle = ({
  step,
  type,
  size,
  stepNumber,
}: {
  step: ResolvedStep;
  type: StepType;
  size: StepSize;
  stepNumber: number;
}) => (
  <div
    className={clsx(
      'relative flex items-center justify-center rounded-full shrink-0',
      CIRCLE[size],
      circleClass(step.resolvedStatus),
    )}
  >
    <CircleContent
      status={step.resolvedStatus}
      type={type}
      stepNumber={stepNumber}
      icon={step.icon}
      size={size}
    />
  </div>
);

// ─── Horizontal (navigation bar) layout ──────────────────────────────────────
//  Icon + text inline, chevron separators, active bottom border on current step.
//  Used for multi-step navigation headers.

const HorizontalLayout = ({
  steps,
  type,
  size,
  showDescription,
  className,
}: {
  steps: ResolvedStep[];
  type: StepType;
  size: StepSize;
  showDescription: boolean;
  className?: string;
}) => (
  <div className={clsx('flex items-stretch', className)}>
    {steps.map((step, i) => {
      const isLast = i === steps.length - 1;
      const isCurrent = step.resolvedStatus === 'current' || step.resolvedStatus === 'in-progress';

      return (
        <Fragment key={i}>
          <div
            className={clsx(
              'flex-1 flex items-center py-3 border-b-2 min-w-0',
              NAV_GAP[size],
              isCurrent ? 'border-primary' : 'border-transparent',
            )}
          >
            <StepCircle step={step} type={type} size={size} stepNumber={i + 1} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className={clsx(TITLE.horizontal[size], 'truncate', titleColor(step.resolvedStatus, 'horizontal'))}>
                {step.title}
              </span>
              {showDescription && step.description && (
                <span className={clsx(DESC[size], 'truncate', descColor(step.resolvedStatus))}>
                  {step.description}
                </span>
              )}
            </div>
          </div>
          {!isLast && (
            <div className="flex items-center shrink-0 text-neutral-p60 pb-[2px]">
              <ChevronSvg />
            </div>
          )}
        </Fragment>
      );
    })}
  </div>
);

// ─── Vertical (wizard) layout ─────────────────────────────────────────────────
//  Icon centered at top, horizontal connector lines between icons, text below.
//  Used as a wizard / stepper progress indicator.

const VerticalLayout = ({
  steps,
  type,
  size,
  showDescription,
  className,
}: {
  steps: ResolvedStep[];
  type: StepType;
  size: StepSize;
  showDescription: boolean;
  className?: string;
}) => (
  <div className={clsx('flex items-start', className)}>
    {steps.map((step, i) => {
      const isFirst = i === 0;
      const isLast  = i === steps.length - 1;

      // Connector between step[i-1] and step[i] = green if step[i-1] is finished
      const leftColor = isFirst
        ? 'bg-transparent'
        : steps[i - 1].resolvedStatus === 'finished'
          ? 'bg-primary'
          : 'bg-neutral-p70';

      // Connector between step[i] and step[i+1] = green if step[i] is finished
      const rightColor = isLast
        ? 'bg-transparent'
        : step.resolvedStatus === 'finished'
          ? 'bg-primary'
          : 'bg-neutral-p70';

      return (
        <div key={i} className="flex-1 flex flex-col items-center min-w-0 py-3">
          {/* Icon row with half-connectors */}
          <div className="flex w-full items-center">
            <div className={clsx('flex-1 h-[2px]', leftColor)} />
            <StepCircle step={step} type={type} size={size} stepNumber={i + 1} />
            <div className={clsx('flex-1 h-[2px]', rightColor)} />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center text-center mt-3 px-1 w-full">
            <span className={clsx(TITLE.vertical[size], 'truncate w-full', titleColor(step.resolvedStatus, 'vertical'))}>
              {step.title}
            </span>
            {showDescription && step.description && (
              <span className={clsx(DESC[size], 'truncate w-full', descColor(step.resolvedStatus))}>
                {step.description}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── ProgressSteps ────────────────────────────────────────────────────────────

export const ProgressSteps = ({
  steps,
  current         = 0,
  size            = 'md',
  type            = 'default',
  layout          = 'vertical',
  showDescription = true,
  className,
}: ProgressStepsProps) => {
  const resolved: ResolvedStep[] = steps.map((step, i) => ({
    ...step,
    index: i,
    resolvedStatus: step.status ?? (
      i < current ? 'finished' :
      i === current ? 'current' :
      'waiting'
    ),
  }));

  const sharedProps = { steps: resolved, type, size, showDescription, className };

  return layout === 'horizontal'
    ? <HorizontalLayout {...sharedProps} />
    : <VerticalLayout   {...sharedProps} />;
};

ProgressSteps.displayName = 'ProgressSteps';
