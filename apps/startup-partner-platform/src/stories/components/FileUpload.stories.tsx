import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FileUpload, FileUploadDropZone, FileUploadItem } from '@/design-system';
import type { FileUploadProps, FileUploadFile } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/FileUpload',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**FileUpload** — Allkons Design System

Sources:
- [Figma: File Upload Base](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40007899-11070)
- [Figma: File Upload Item Base](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40007900-11305)
- [Figma: Drag and Drop](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40007900-11924)

\`\`\`tsx
<FileUpload
  label="File upload"
  acceptText="SVG, PNG, JPG (max. 10MB)"
  multiple
  files={files}
  onAddFiles={(newFiles) => { /* add to state */ }}
  onRemoveFile={(id) => { /* remove from state */ }}
  onRetryFile={(id) => { /* retry upload */ }}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Sample data ──────────────────────────────────────────────────────────────

const FILES_MIXED: FileUploadFile[] = [
  { id: '1', name: 'File name.pdf', size: 20480,   state: 'uploading', progress: 10 },
  { id: '2', name: 'File name.pdf', size: 204800,  state: 'complete',  progress: 100 },
  { id: '3', name: 'File name.pdf', size: 204800,  state: 'failed' },
];

const FILES_UPLOADING: FileUploadFile[] = [
  { id: '1', name: 'document.pdf',   size: 51200,  state: 'uploading', progress: 35 },
  { id: '2', name: 'photo.png',       size: 204800, state: 'uploading', progress: 72 },
];

const FILES_COMPLETE: FileUploadFile[] = [
  { id: '1', name: 'report.pdf',    size: 307200, state: 'complete' },
  { id: '2', name: 'logo.svg',       size: 8192,  state: 'complete' },
  { id: '3', name: 'screenshot.png', size: 102400, state: 'complete' },
];

// ─── Drop Zone only ───────────────────────────────────────────────────────────

export const DropZoneVariants: StoryObj = {
  name: 'Drop Zone — All Variants',
  render: () => (
    <div className="flex flex-col gap-8 max-w-lg">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Default — md</p>
        <FileUploadDropZone size="md" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Default — sm</p>
        <FileUploadDropZone size="sm" />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Destructive — md</p>
        <FileUploadDropZone size="md" destructive />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Destructive — sm</p>
        <FileUploadDropZone size="sm" destructive />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Disabled — md</p>
        <FileUploadDropZone size="md" disabled />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Disabled — sm</p>
        <FileUploadDropZone size="sm" disabled />
      </div>

    </div>
  ),
};

// ─── File Items ───────────────────────────────────────────────────────────────

export const FileItems: StoryObj = {
  name: 'File Items — All States',
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Uploading</p>
        <FileUploadItem
          fileName="File name.pdf"
          fileSize="20 KB of 200 KB"
          state="uploading"
          progress={10}
          onRemove={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Uploading — 72%</p>
        <FileUploadItem
          fileName="photo-large.png"
          fileSize="72 KB of 200 KB"
          state="uploading"
          progress={72}
          onRemove={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Complete</p>
        <FileUploadItem
          fileName="File name.pdf"
          fileSize="200 KB of 200 KB"
          state="complete"
          onRemove={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Failed</p>
        <FileUploadItem
          fileName="File name.pdf"
          fileSize="200 KB of 200 KB"
          state="failed"
          onRemove={() => {}}
          onRetry={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No size / No remove</p>
        <FileUploadItem
          fileName="document-without-size.pdf"
          state="uploading"
          progress={45}
        />
      </div>

    </div>
  ),
};

// ─── Empty (no files) ─────────────────────────────────────────────────────────

export const Empty: StoryObj = {
  name: 'Empty — No files',
  render: () => (
    <div className="flex flex-col gap-8 max-w-lg">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Desktop (md)</p>
        <FileUpload
          label="File upload"
          acceptText="SVG, PNG, JPG, GIF or HEIC (max. 800×400px)"
          multiple
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Mobile (sm)</p>
        <FileUpload
          label="File upload"
          size="sm"
          acceptText="SVG, PNG, JPG, GIF or HEIC (max. 800×400px)"
          multiple
        />
      </div>

    </div>
  ),
};

// ─── With files queued ────────────────────────────────────────────────────────

export const WithFilesQueued: StoryObj = {
  name: 'With Files Queued',
  render: () => (
    <div className="flex flex-col gap-8 max-w-lg">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Mixed states</p>
        <FileUpload
          label="File upload"
          acceptText="SVG, PNG, JPG (max. 10MB)"
          multiple
          files={FILES_MIXED}
          onAddFiles={() => {}}
          onRemoveFile={() => {}}
          onRetryFile={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">All uploading</p>
        <FileUpload
          label="File upload"
          multiple
          files={FILES_UPLOADING}
          onRemoveFile={() => {}}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">All complete</p>
        <FileUpload
          label="File upload"
          multiple
          files={FILES_COMPLETE}
          onRemoveFile={() => {}}
        />
      </div>

    </div>
  ),
};

// ─── Destructive ──────────────────────────────────────────────────────────────

export const Destructive: StoryObj = {
  name: 'Destructive',
  render: () => (
    <div className="flex flex-col gap-8 max-w-lg">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No files</p>
        <FileUpload
          label="File upload"
          destructive
          hintText="File type not supported. Please upload SVG, PNG or JPG."
          acceptText="SVG, PNG, JPG (max. 10MB)"
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">With failed file</p>
        <FileUpload
          label="File upload"
          destructive
          hintText="Upload failed. Please try again."
          files={[{ id: '1', name: 'File name.pdf', size: 204800, state: 'failed' }]}
          onRemoveFile={() => {}}
          onRetryFile={() => {}}
        />
      </div>

    </div>
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: StoryObj = {
  name: 'Disabled',
  render: () => (
    <div className="flex flex-col gap-6 max-w-lg">
      <FileUpload
        label="File upload"
        disabled
        acceptText="SVG, PNG, JPG (max. 10MB)"
      />
      <FileUpload
        label="File upload (sm)"
        size="sm"
        disabled
        acceptText="SVG, PNG, JPG (max. 10MB)"
      />
    </div>
  ),
};

// ─── With hint text ───────────────────────────────────────────────────────────

export const WithHintText: StoryObj = {
  name: 'With Hint Text',
  render: () => (
    <div className="flex flex-col gap-6 max-w-lg">
      <FileUpload
        label="Attachment"
        hintText="Helper text"
        acceptText="SVG, PNG, JPG (max. 10MB)"
        multiple
      />
      <FileUpload
        label="Attachment (error)"
        destructive
        hintText="File format not supported."
        acceptText="SVG, PNG, JPG (max. 10MB)"
      />
    </div>
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<FileUploadProps> = {
  name: 'Playground',
  args: {
    label:        'File upload',
    hintText:     '',
    acceptText:   'SVG, PNG, JPG, GIF or HEIC (max. 800×400px)',
    multiple:     true,
    disabled:     false,
    destructive:  false,
    size:         'md',
    files:        FILES_MIXED,
  },
  argTypes: {
    size:        { control: 'radio', options: ['md', 'sm'] },
    disabled:    { control: 'boolean' },
    destructive: { control: 'boolean' },
    label:       { control: 'text' },
    hintText:    { control: 'text' },
    acceptText:  { control: 'text' },
    multiple:    { control: 'boolean' },
  },
  render: (args) => (
    <div className="max-w-lg">
      <FileUpload
        {...args}
        onAddFiles={() => {}}
        onRemoveFile={() => {}}
        onRetryFile={() => {}}
      />
    </div>
  ),
};
