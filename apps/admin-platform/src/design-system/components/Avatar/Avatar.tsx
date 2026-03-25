'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Avatar spec     — node 250:32148
//        UserPicture     — node 40001609:26699
//        OnlineIndicator — node 40001609:26996
//        VerifiedTick    — node 40001609:27002
//        CompanyIcon     — node 40001609:27008
//        Notification    — node 40002747:116457
//        Context badge   — node 40003418:5415
//        AvatarLabelGroup— node 40001625:30803
//
// Size  = xs(24) | sm(32) | md(40) | lg(48) | xl(56)
// Corner= full | rounded | none
// Content= image | placeholder (auto) | initials (auto) | icon (auto)
// Indicator= none | online | offline | company | verified | edit | notification | context

export type AvatarSize        = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarCorner      = 'full' | 'rounded' | 'none';
export type AvatarIndicator   =
  | 'none'
  | 'online'
  | 'offline'
  | 'company'
  | 'verified'
  | 'edit'
  | 'notification'
  | 'context';
export type AvatarContextType = 'personal' | 'juristic-personal' | 'juristic';

export interface AvatarProps {
  /** xs=24px | sm=32px | md=40px | lg=48px | xl=56px. Default: md */
  size?: AvatarSize;
  /** Corner shape. Default: full (circle) */
  corner?: AvatarCorner;
  /** Image URL — component renders as image type */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** 1-2 char string — component renders as initials type */
  initials?: string;
  /** Custom icon ReactNode — component renders as icon type */
  icon?: ReactNode;
  /** Badge indicator shown at bottom-right. Default: none */
  indicator?: AvatarIndicator;
  /** For indicator='online' | 'offline': true=green, false=gray. Default: true */
  online?: boolean;
  /** For indicator='context'. Default: personal */
  contextType?: AvatarContextType;
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const AVATAR_SIZE: Record<AvatarSize, string> = {
  xs: 'w-6 h-6',    // 24px
  sm: 'w-8 h-8',    // 32px
  md: 'w-10 h-10',  // 40px
  lg: 'w-12 h-12',  // 48px
  xl: 'w-14 h-14',  // 56px
};

const INITIALS_TEXT: Record<AvatarSize, string> = {
  xs: 'text-[8px] font-semibold leading-none',
  sm: 'text-[10px] font-semibold leading-none',
  md: 'text-xs font-semibold leading-none',
  lg: 'text-sm font-semibold leading-none',
  xl: 'text-base font-semibold leading-none',
};

// Icon slot inside avatar (placeholder user icon / custom icon)
const ICON_SLOT: Record<AvatarSize, string> = {
  xs: 'w-3 h-3',    // 12px
  sm: 'w-4 h-4',    // 16px
  md: 'w-5 h-5',    // 20px
  lg: 'w-6 h-6',    // 24px
  xl: 'w-7 h-7',    // 28px
};

const CORNER: Record<AvatarCorner, string> = {
  full:    'rounded-full',
  rounded: 'rounded-lg',
  none:    '',
};

// ── Indicator badge size maps (from Figma per-component specs) ────────────────

// Online / Notification dot: xs=6 sm=8 md=10 lg=12 xl=16
const DOT_SIZE: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

// Verified / Edit / Company / Context badge: xs=10 sm=12 md=14 lg=16 xl=20
const BADGE_SIZE: Record<AvatarSize, string> = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

const CONTEXT_BG: Record<AvatarContextType, string> = {
  personal:            'bg-primary',
  'juristic-personal': 'bg-warning',
  juristic:            'bg-info',
};

// ─── Inline SVG icons (badge indicators) ─────────────────────────────────────

const CheckSvg = () => (
  <svg viewBox="0 0 10 10" fill="none" className="w-[65%] h-[65%]">
    <path
      d="M2 5l2.5 2.5 3.5-4.5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingSvg = () => (
  <svg viewBox="0 0 10 10" fill="none" className="w-[65%] h-[65%]">
    <rect x="1" y="3" width="8" height="6.5" rx="0.5" stroke="#7C889C" strokeWidth="0.8" />
    <path d="M4 9.5V7h2v2.5" stroke="#7C889C" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M3 4.5h1m2 0h1M3 6h1m2 0h1" stroke="#7C889C" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M4 3V1.5h2V3" stroke="#7C889C" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

const PencilSvg = () => (
  <svg viewBox="0 0 10 10" fill="none" className="w-[60%] h-[60%]">
    <path
      d="M6.5 1.5l2 2L3 9H1V7L6.5 1.5z"
      stroke="#7C889C"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PersonSvg = () => (
  <svg viewBox="0 0 10 10" fill="white" className="w-[60%] h-[60%]">
    <circle cx="5" cy="3.5" r="1.5" />
    <path d="M1.5 9C1.5 7.1 3.1 6 5 6s3.5 1.1 3.5 3" />
  </svg>
);

const TeamSvg = () => (
  <svg viewBox="0 0 10 10" fill="white" className="w-[60%] h-[60%]">
    <circle cx="3.5" cy="3.5" r="1.2" />
    <circle cx="6.5" cy="3.5" r="1.2" />
    <path d="M0.5 9c0-1.5 1.3-2.3 3-2.3M9.5 9c0-1.5-1.3-2.3-3-2.3M5 9c0-1.5-1.3-2.3-3-2.3" />
  </svg>
);

const BriefcaseSvg = () => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="white"
    strokeWidth="0.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[60%] h-[60%]"
  >
    <rect x="1" y="4" width="8" height="5.5" rx="0.5" />
    <path d="M3.5 4V3a1.5 1.5 0 013 0v1" />
  </svg>
);

// Placeholder user silhouette (shown when no src/initials/icon)
const PlaceholderUserSvg = ({ size }: { size: AvatarSize }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className={clsx('text-neutral-p60', ICON_SLOT[size])}
  >
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2-8 4.5V20h16v-1.5c0-2.5-3.6-4.5-8-4.5z" />
  </svg>
);

// ─── Indicator badge components ───────────────────────────────────────────────

const OnlineDot = ({ size, online }: { size: AvatarSize; online: boolean }) => (
  <span
    className={clsx(
      'rounded-full ring-[1.5px] ring-white',
      DOT_SIZE[size],
      online ? 'bg-success' : 'bg-neutral-p60',
    )}
  />
);

const NotificationDot = ({ size }: { size: AvatarSize }) => (
  <span className={clsx('rounded-full ring-[1.5px] ring-white bg-error', DOT_SIZE[size])} />
);

const VerifiedBadge = ({ size }: { size: AvatarSize }) => (
  <span
    className={clsx(
      'rounded-full flex items-center justify-center overflow-hidden ring-[1px] ring-white bg-brand',
      BADGE_SIZE[size],
    )}
  >
    <CheckSvg />
  </span>
);

const CompanyBadge = ({ size }: { size: AvatarSize }) => (
  <span
    className={clsx(
      'rounded-full flex items-center justify-center overflow-hidden ring-[1px] ring-white bg-white shadow-sm',
      BADGE_SIZE[size],
    )}
  >
    <BuildingSvg />
  </span>
);

const EditBadge = ({ size }: { size: AvatarSize }) => (
  <span
    className={clsx(
      'rounded-full flex items-center justify-center overflow-hidden ring-[1px] ring-white bg-neutral-p95 shadow-sm',
      BADGE_SIZE[size],
    )}
  >
    <PencilSvg />
  </span>
);

const ContextBadge = ({
  size,
  contextType,
}: {
  size: AvatarSize;
  contextType: AvatarContextType;
}) => {
  const iconMap: Record<AvatarContextType, React.ReactNode> = {
    personal:            <PersonSvg />,
    'juristic-personal': <TeamSvg />,
    juristic:            <BriefcaseSvg />,
  };

  return (
    <span
      className={clsx(
        'rounded-full flex items-center justify-center overflow-hidden ring-[1px] ring-white',
        BADGE_SIZE[size],
        CONTEXT_BG[contextType],
      )}
    >
      {iconMap[contextType]}
    </span>
  );
};

const IndicatorBadge = ({
  indicator,
  size,
  online,
  contextType,
}: {
  indicator: AvatarIndicator;
  size: AvatarSize;
  online: boolean;
  contextType: AvatarContextType;
}) => {
  switch (indicator) {
    case 'online':        return <OnlineDot size={size} online={true} />;
    case 'offline':       return <OnlineDot size={size} online={false} />;
    case 'notification':  return <NotificationDot size={size} />;
    case 'verified':      return <VerifiedBadge size={size} />;
    case 'company':       return <CompanyBadge size={size} />;
    case 'edit':          return <EditBadge size={size} />;
    case 'context':       return <ContextBadge size={size} contextType={contextType} />;
    default:              return null;
  }
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar = ({
  size         = 'md',
  corner       = 'full',
  src,
  alt          = '',
  initials,
  icon,
  indicator    = 'none',
  online       = true,
  contextType  = 'personal',
  className,
}: AvatarProps) => {
  // Content is derived from props (image > initials > icon > placeholder)
  const content = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  ) : initials ? (
    <span className={clsx('text-neutral-20 select-none', INITIALS_TEXT[size])}>
      {initials.slice(0, 2).toUpperCase()}
    </span>
  ) : icon ? (
    <span className={clsx('flex items-center justify-center', ICON_SLOT[size])}>
      {icon}
    </span>
  ) : (
    <PlaceholderUserSvg size={size} />
  );

  const avatarEl = (
    <span
      className={clsx(
        'relative inline-flex items-center justify-center shrink-0 overflow-hidden',
        AVATAR_SIZE[size],
        CORNER[corner],
        // Placeholder/initials/icon get a subtle bg; image uses its own pixels
        !src && 'bg-neutral-p90',
      )}
    >
      {content}
    </span>
  );

  if (indicator === 'none') {
    return (
      <span className={clsx('relative inline-block shrink-0', className)}>
        {avatarEl}
      </span>
    );
  }

  return (
    <span className={clsx('relative inline-block shrink-0', className)}>
      {avatarEl}
      <span className="absolute bottom-0 right-0 pointer-events-none">
        <IndicatorBadge
          indicator={indicator}
          size={size}
          online={online}
          contextType={contextType}
        />
      </span>
    </span>
  );
};

Avatar.displayName = 'Avatar';

// ─── AvatarLabelGroup ─────────────────────────────────────────────────────────
// Figma: node 40001625:30803 — Avatar + display name + supporting text
// Sizes: xs / sm / md / lg (no xl)

export type AvatarLabelGroupSize = Exclude<AvatarSize, 'xl'>;

export interface AvatarLabelGroupProps {
  /** xs/sm/md/lg (no xl). Default: md */
  size?: AvatarLabelGroupSize;
  /** Props forwarded to the inner Avatar (all Avatar props except size) */
  avatarProps?: Omit<AvatarProps, 'size'>;
  /** Primary display name */
  name: string;
  /** Supporting text (role, email, etc.) */
  supporting?: string;
  className?: string;
}

const GROUP_GAP: Record<AvatarLabelGroupSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3',
};

const NAME_TEXT: Record<AvatarLabelGroupSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

const SUB_TEXT: Record<AvatarLabelGroupSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
};

export const AvatarLabelGroup = ({
  size         = 'md',
  avatarProps  = {},
  name,
  supporting,
  className,
}: AvatarLabelGroupProps) => (
  <div className={clsx('inline-flex items-center', GROUP_GAP[size], className)}>
    <Avatar size={size} {...avatarProps} />
    <div className="flex flex-col justify-center min-w-0">
      <span className={clsx('font-semibold text-text-primary truncate', NAME_TEXT[size])}>
        {name}
      </span>
      {supporting && (
        <span className={clsx('text-text-tertiary truncate', SUB_TEXT[size])}>
          {supporting}
        </span>
      )}
    </div>
  </div>
);

AvatarLabelGroup.displayName = 'AvatarLabelGroup';
