'use client';

import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: SocialIcons — property1 (theme) × property2 (platform)

export type SocialIconTheme = 'Brand' | 'Dark' | 'White';

export type SocialPlatform =
  | 'AngelList' | 'Apple' | 'Clubhouse' | 'Discord' | 'Dribbble'
  | 'Facebook' | 'Figma' | 'Github' | 'Google' | 'Gumroad'
  | 'Instagram' | 'LinkedIn' | 'Pinterest' | 'PlayMarket' | 'Reddit'
  | 'Snapchat' | 'Telegram' | 'Tumblr' | 'Twitter' | 'Youtube';

export interface SocialIconProps {
  /** Social platform to display */
  platform: SocialPlatform;
  /** Color theme: Brand (full color) | Dark (monochrome) | White (inverted) */
  theme?: SocialIconTheme;
  /** Override image src (defaults to /images/icons/social/{theme}/{platform}.svg) */
  src?: string;
  /** Image alt text */
  alt?: string;
  className?: string;
}

// ─── Platform display names ───────────────────────────────────────────────────

const platformName: Record<SocialPlatform, string> = {
  AngelList:  'AngelList',
  Apple:      'Apple',
  Clubhouse:  'Clubhouse',
  Discord:    'Discord',
  Dribbble:   'Dribbble',
  Facebook:   'Facebook',
  Figma:      'Figma',
  Github:     'GitHub',
  Google:     'Google',
  Gumroad:    'Gumroad',
  Instagram:  'Instagram',
  LinkedIn:   'LinkedIn',
  Pinterest:  'Pinterest',
  PlayMarket: 'Play Market',
  Reddit:     'Reddit',
  Snapchat:   'Snapchat',
  Telegram:   'Telegram',
  Tumblr:     'Tumblr',
  Twitter:    'Twitter',
  Youtube:    'YouTube',
};

// ─── Component ────────────────────────────────────────────────────────────────
// Figma: 24×24px per variant

export const SocialIcon = ({
  platform,
  theme = 'Brand',
  src,
  alt,
  className,
}: SocialIconProps) => {
  const imageSrc = src ?? `/images/icons/social/${theme}/${platform}.svg`;
  const label = alt ?? `${platformName[platform]} icon`;

  return (
    <span
      className={clsx('inline-flex shrink-0 w-6 h-6 relative', className)}
      aria-label={label}
    >
      <Image
        src={imageSrc}
        alt={label}
        fill
        className="object-contain"
        sizes="24px"
      />
    </span>
  );
};

SocialIcon.displayName = 'SocialIcon';
