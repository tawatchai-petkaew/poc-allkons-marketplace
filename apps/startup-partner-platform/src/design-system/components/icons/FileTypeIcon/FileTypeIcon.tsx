'use client';

import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: FileType — style × type (node: 40001861:12151)

export type FileTypeIconStyle = 'Integration' | 'Filled';

export type FileType =
  // Integration (11): mix of .png brand logos and .svg generic icons
  | 'PDF' | 'Word' | 'Excel' | 'Powerpoint' | 'CSV' | 'TXT'
  | 'AI' | 'DWG' | 'ZIP' | 'JPG' | 'Other'
  // Filled only (2): generic file-shape icons
  | 'PNG' | 'Image';

export interface FileTypeIconProps {
  /** File format */
  type: FileType;
  /**
   * Integration — shows the app brand logo (Office, Adobe, etc.)
   * Filled — shows a generic filled file-shape icon
   */
  style?: FileTypeIconStyle;
  /** Override the image src */
  src?: string;
  className?: string;
}

// ─── Asset map ────────────────────────────────────────────────────────────────
// Integration: 8 brand logos exported as .png, 3 generic icons as .svg
// Filled: PDF, PNG, Image — all .svg

const INTEGRATION_EXT: Partial<Record<FileType, 'png' | 'svg'>> = {
  // .png brand logos
  PDF: 'png', Word: 'png', Excel: 'png', Powerpoint: 'png',
  CSV: 'png', TXT: 'png', AI: 'png', DWG: 'png',
  // .svg generic icons
  ZIP: 'svg', JPG: 'svg', Other: 'svg',
};

// Types available per style (for validation / story use)
export const FILE_TYPES_INTEGRATION: FileType[] = [
  'PDF', 'Word', 'Excel', 'Powerpoint', 'CSV', 'TXT', 'AI', 'DWG', 'ZIP', 'JPG', 'Other',
];
export const FILE_TYPES_FILLED: FileType[] = ['PDF', 'PNG', 'Image'];

function resolveImageSrc(type: FileType, style: FileTypeIconStyle): string {
  if (style === 'Filled') {
    return `/images/icons/file-types/Filled/${type}.svg`;
  }
  const ext = INTEGRATION_EXT[type] ?? 'svg';
  return `/images/icons/file-types/Integration/${type}.${ext}`;
}

// ─── Layout config per variant ────────────────────────────────────────────────
// Figma: base container is 24×24px
// Integration brand logos (.png): 2px padding to stay inside frame
// Integration generic (.svg) and Filled: clip to frame edge

type LayoutKey = 'padded' | 'clip';

function getLayout(type: FileType, style: FileTypeIconStyle): LayoutKey {
  if (style === 'Filled') return 'clip';
  if (INTEGRATION_EXT[type] === 'png') return 'padded';
  return 'clip';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FileTypeIcon = ({
  type,
  style = 'Integration',
  src,
  className,
}: FileTypeIconProps) => {
  const layout = getLayout(type, style);
  const imageSrc = src ?? resolveImageSrc(type, style);
  const alt = `${type} file`;

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 relative w-6 h-6',
        layout === 'padded' ? 'items-center justify-center p-[2px]' : 'overflow-clip',
        className
      )}
      aria-label={alt}
      title={alt}
    >
      {layout === 'padded' ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={20}
          height={20}
          className="object-contain w-full h-full"
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-contain"
          sizes="24px"
        />
      )}
    </span>
  );
};

FileTypeIcon.displayName = 'FileTypeIcon';
