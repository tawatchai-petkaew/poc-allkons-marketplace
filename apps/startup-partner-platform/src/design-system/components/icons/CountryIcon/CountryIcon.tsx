'use client';

import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Country icons — ISO 3166-1 alpha-2 country codes, 24×24px

export interface CountryIconProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "TH", "US", "GB") */
  country: string;
  /** Override image src (defaults to /images/icons/countries/{country}.svg) */
  src?: string;
  /** Alt text (defaults to country code) */
  alt?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Figma: 24×24px circular flag

export const CountryIcon = ({
  country,
  src,
  alt,
  className,
}: CountryIconProps) => {
  const code = country.toUpperCase();
  const imageSrc = src ?? `/images/icons/countries/${code}.svg`;
  const label = alt ?? `${code} flag`;

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 w-6 h-6 rounded-full overflow-hidden',
        'border border-neutral-p80',
        className
      )}
      aria-label={label}
      title={code}
    >
      <Image
        src={imageSrc}
        alt={label}
        width={24}
        height={24}
        className="object-cover w-full h-full"
        sizes="24px"
      />
    </span>
  );
};

CountryIcon.displayName = 'CountryIcon';
