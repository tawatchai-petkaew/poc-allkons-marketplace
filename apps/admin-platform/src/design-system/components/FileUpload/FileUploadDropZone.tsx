'use client';

import { type DragEvent, useState } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: File Upload Base — node 40007899:11070
//
// Sizes        = md (512px, px-6 py-4) | sm (320px, px-4 py-3)
// States       = Default | Hover | Disabled
// Destructive  = error red border variant

export type FileUploadDropZoneSize = 'md' | 'sm';

export interface FileUploadDropZoneProps {
  size?: FileUploadDropZoneSize;
  /** Disables all interaction */
  disabled?: boolean;
  /** Error state — red border */
  destructive?: boolean;
  /** Accepted formats hint text below the action */
  acceptText?: string;
  /** Called when "Click to upload" is pressed */
  onClick?: () => void;
  /** Called when files are dropped onto the zone */
  onDrop?: (files: File[]) => void;
  className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const UploadCloudIcon = ({ size }: { size: 20 | 24 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    style={{ width: size, height: size }}
  >
    <path
      d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M8 16l4-4 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── FileUploadDropZone ───────────────────────────────────────────────────────

export const FileUploadDropZone = ({
  size = 'md',
  disabled = false,
  destructive = false,
  acceptText = 'SVG, PNG, JPG, GIF or HEIC (max. 800x400px)',
  onClick,
  onDrop,
  className,
}: FileUploadDropZoneProps) => {
  const isSm = size === 'sm';
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onDrop?.(files);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'border rounded-lg w-full transition-colors select-none',
        isSm ? 'px-4 py-3' : 'px-6 py-4',
        // Disabled
        disabled && 'border-[#EFF0F3] bg-neutral-p95 cursor-not-allowed',
        // Interactive states
        !disabled && [
          'cursor-pointer',
          isDragOver
            ? destructive ? 'border-[#AE1A0C] bg-white' : 'border-primary bg-white'
            : destructive
              ? 'border-error bg-white'
              : 'border-neutral-p80 bg-white hover:border-primary',
        ],
        className,
      )}
    >
      {/* Content */}
      <div className={clsx(
        'flex flex-col items-center w-full pointer-events-none',
        isSm ? 'gap-2' : 'gap-3',
      )}>

        {/* Upload cloud icon in bordered box */}
        <div className={clsx(
          'bg-white border p-2 rounded-md',
          disabled
            ? 'border-neutral-p80'
            : destructive
              ? 'border-[#F0A69F]'
              : 'border-neutral-p80',
        )}>
          <span className={clsx(
            disabled
              ? 'text-text-disabled'
              : destructive
                ? 'text-error'
                : 'text-text-tertiary',
          )}>
            <UploadCloudIcon size={isSm ? 20 : 24} />
          </span>
        </div>

        {/* Text area */}
        <div className={clsx(
          'flex flex-col items-center w-full',
          isSm ? 'gap-0' : 'gap-1',
        )}>
          {/* Action row */}
          <div className="flex gap-2 items-center">
            <span className={clsx(
              'text-sm font-semibold leading-5',
              disabled
                ? 'text-text-disabled'
                : destructive
                  ? 'text-error'
                  : 'text-primary-text',
            )}>
              Click to upload
            </span>
            <span className={clsx(
              'text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap',
              disabled ? 'text-text-disabled' : 'text-text-tertiary',
            )}>
              or drag and drop
            </span>
          </div>

          {/* Accepted formats hint */}
          <p className={clsx(
            'text-sm text-center w-full overflow-hidden text-ellipsis whitespace-nowrap',
            disabled ? 'text-text-disabled' : 'text-text-placeholder',
          )}>
            {acceptText}
          </p>
        </div>
      </div>
    </div>
  );
};

FileUploadDropZone.displayName = 'FileUploadDropZone';
