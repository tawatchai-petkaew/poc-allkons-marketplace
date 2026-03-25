'use client';

import { useRef } from 'react';
import { clsx } from 'clsx';
import { FileUploadDropZone } from './FileUploadDropZone';
import { FileUploadItem } from './FileUploadItem';
import type { FileUploadItemState } from './FileUploadItem';

export type { FileUploadItemState };

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Drag and Drop — node 40007900:11924
//
// Layout  = label? + drop-zone + file-queue? + hint-text?
// Mobile  = sm size, always shows drop zone
// Desktop = md size, always shows drop zone

export interface FileUploadFile {
  /** Unique identifier */
  id: string;
  /** Displayed file name */
  name: string;
  /** File size in bytes — auto-formatted if provided */
  size?: number;
  /** Current upload state */
  state: FileUploadItemState;
  /** Upload progress 0–100 */
  progress?: number;
}

export interface FileUploadProps {
  /** Optional label above the drop zone */
  label?: string;
  /** Helper text below the component (error-colored when destructive) */
  hintText?: string;
  /** Accepted MIME types passed to <input accept="…">, e.g. "image/*,.pdf" */
  accept?: string;
  /** Accepted formats display text shown in the drop zone */
  acceptText?: string;
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Disables all interaction */
  disabled?: boolean;
  /** Error/destructive state — red borders */
  destructive?: boolean;
  /** Size variant — md for desktop, sm for mobile */
  size?: 'md' | 'sm';
  /** Controlled file list */
  files?: FileUploadFile[];
  /** Called when the user selects or drops new files */
  onAddFiles?: (files: File[]) => void;
  /** Called when the user clicks remove on a file */
  onRemoveFile?: (id: string) => void;
  /** Called when the user clicks "Try again" on a failed file */
  onRetryFile?: (id: string) => void;
  /** Extra classes on root wrapper */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── FileUpload ───────────────────────────────────────────────────────────────

export const FileUpload = ({
  label,
  hintText,
  accept,
  acceptText,
  multiple = false,
  disabled = false,
  destructive = false,
  size = 'md',
  files = [],
  onAddFiles,
  onRemoveFile,
  onRetryFile,
  className,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) onAddFiles?.(selected);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (droppedFiles: File[]) => {
    if (droppedFiles.length > 0) onAddFiles?.(droppedFiles);
  };

  const isSm = size === 'sm';

  return (
    <div className={clsx(
      'flex flex-col w-full',
      isSm ? 'gap-2' : 'gap-3',
      className,
    )}>

      {/* Label */}
      {label && (
        <span className="text-base font-medium text-text-secondary leading-6">
          {label}
        </span>
      )}

      {/* Drop zone */}
      <FileUploadDropZone
        size={size}
        disabled={disabled}
        destructive={destructive}
        acceptText={acceptText}
        onClick={handleClickUpload}
        onDrop={handleDrop}
      />

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {/* File queue */}
      {files.length > 0 && (
        <div className={clsx(
          'flex flex-col w-full',
          isSm ? 'gap-2' : 'gap-3',
        )}>
          {files.map((file) => {
            // Build formatted size label
            const sizeLabel = file.size !== undefined ? formatBytes(file.size) : undefined;

            return (
              <FileUploadItem
                key={file.id}
                fileName={file.name}
                fileSize={sizeLabel}
                state={file.state}
                progress={file.progress}
                onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
                onRetry={
                  onRetryFile && file.state === 'failed'
                    ? () => onRetryFile(file.id)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* Hint text */}
      {hintText && (
        <p className={clsx(
          'text-sm leading-5 overflow-hidden text-ellipsis whitespace-nowrap',
          destructive ? 'text-error' : 'text-text-quinary',
        )}>
          {hintText}
        </p>
      )}
    </div>
  );
};

FileUpload.displayName = 'FileUpload';
