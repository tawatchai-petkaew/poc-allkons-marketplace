'use client';

import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: File Upload Item Base — node 40007900:11305
//
// States = uploading (in-progress) | complete | failed
// Progress bar shown for uploading/complete states

export type FileUploadItemState = 'uploading' | 'complete' | 'failed';

export interface FileUploadItemProps {
  /** File name displayed as the primary label */
  fileName: string;
  /** Pre-formatted size string, e.g. "20 KB of 200 KB" or "200 KB" */
  fileSize?: string;
  /** Current upload state */
  state?: FileUploadItemState;
  /** Upload progress 0–100, shown as a progress bar */
  progress?: number;
  /** Called when the delete button is clicked */
  onRemove?: () => void;
  /** Called when "Try again" is clicked (failed state only) */
  onRetry?: () => void;
  className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

// delete-bin-6-line (16px)
const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4">
    <path
      d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4H3.333z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// checkbox-circle-line (16px) — complete state
const CheckCircleIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4">
    <path
      d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334Z"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M5.333 8l2 2 3.334-3.333"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// information-line (16px) — failed state
const InfoCircleIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4">
    <path
      d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334Z"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M8 8v3.333"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <circle cx="8" cy="5.5" r="0.667" fill="currentColor" />
  </svg>
);

// upload-cloud-2-line (16px) — uploading status
const UploadingIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4">
    <path
      d="M2.667 9.933A4.667 4.667 0 1 1 10.473 5.333h1.194a3 3 0 0 1 1.666 5.495"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 8v5.333M6 11l2-2 2 2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Generic file icon (40×40) — file-type indicator
const FileIcon = () => (
  <div className="w-10 h-10 rounded-md bg-error-subtle flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5 text-error">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// ─── FileUploadItem ───────────────────────────────────────────────────────────

export const FileUploadItem = ({
  fileName,
  fileSize,
  state = 'uploading',
  progress = 0,
  onRemove,
  onRetry,
  className,
}: FileUploadItemProps) => {
  const showProgressBar = state === 'uploading' || state === 'complete';
  const displayProgress = state === 'complete' ? 100 : Math.min(100, Math.max(0, progress));

  return (
    <div
      className={clsx(
        'relative bg-white border rounded-lg p-4 w-full',
        state === 'failed' ? 'border-error' : 'border-neutral-p80',
        className,
      )}
    >
      <div className="flex gap-3 items-start">

        {/* Left: file type icon */}
        <FileIcon />

        {/* Right: content */}
        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-7">

          {/* Filename + supporting text row */}
          <div className="flex flex-col gap-0">
            {/* Filename */}
            <span className="text-sm text-text-secondary leading-5 truncate">
              {fileName}
            </span>

            {/* Supporting text: size | status */}
            <div className="flex items-center gap-3">
              {fileSize && (
                <span className="text-sm text-text-quinary leading-5 whitespace-nowrap shrink-0">
                  {fileSize}
                </span>
              )}
              {/* Vertical divider */}
              {fileSize && (
                <span className="w-px h-3 bg-neutral-p80 shrink-0" aria-hidden />
              )}
              {/* Status icon + text */}
              <div className="flex items-center gap-1">
                {state === 'uploading' && (
                  <span className="text-text-tertiary"><UploadingIcon /></span>
                )}
                {state === 'complete' && (
                  <span className="text-success"><CheckCircleIcon /></span>
                )}
                {state === 'failed' && (
                  <span className="text-error"><InfoCircleIcon /></span>
                )}
                <span className={clsx(
                  'text-sm leading-5 whitespace-nowrap',
                  state === 'uploading' && 'text-text-quinary',
                  state === 'complete'  && 'text-success',
                  state === 'failed'    && 'text-error',
                )}>
                  {state === 'uploading' && 'Uploading...'}
                  {state === 'complete'  && 'Complete'}
                  {state === 'failed'    && 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Failed: "Try again" */}
          {state === 'failed' && (
            onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="text-xs font-medium text-error leading-4 text-left hover:underline w-fit"
              >
                Try again
              </button>
            ) : (
              <span className="text-xs font-medium text-error leading-4">
                Try again
              </span>
            )
          )}

          {/* Progress bar */}
          {showProgressBar && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-background-secondary overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary leading-4 shrink-0 tabular-nums">
                {displayProgress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete button — absolute top-right (Figma: top-[7px] right-[7px], 32×32) */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${fileName}`}
          className="absolute top-[7px] right-[7px] w-8 h-8 flex items-center justify-center rounded-md text-text-tertiary hover:bg-neutral-p90 hover:text-text-secondary transition-colors"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

FileUploadItem.displayName = 'FileUploadItem';
