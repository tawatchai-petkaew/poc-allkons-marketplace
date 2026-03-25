import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dialog, ConfirmationDialog, Button } from '@/design-system';
import type { DialogProps, DialogSize, ConfirmationDialogProps, ConfirmDialogType } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/Dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Dialog & ConfirmationDialog** — Allkons Design System

Sources:
- [Figma: Dialog](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40009379-116716)
- [Figma: Confirmation Dialog](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40010065-41839)

\`\`\`tsx
// Base dialog
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Heading text"
  description="Supporting text"
  footer={<Button onClick={() => setOpen(false)}>Save</Button>}
>
  {/* content */}
</Dialog>

// Confirmation dialog
<ConfirmationDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  type="default"
  title="Are you sure?"
  description="This action cannot be undone."
  confirmLabel="Yes, continue"
  cancelLabel="Cancel"
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Helper: trigger button ────────────────────────────────────────────────────

const TriggerButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button variant="secondary-neutral" onClick={onClick}>{label}</Button>
);

// ─── Base Dialog ──────────────────────────────────────────────────────────────

export const BaseDialog: StoryObj<DialogProps> = {
  name: 'Base Dialog',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton label="Open Dialog (sm)" onClick={() => setOpen(true)} />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Heading text"
          description="Supporting text below the heading that provides more context."
          footer={
            <div className="flex gap-3 w-full">
              <Button variant="secondary-neutral" size="md" fullWidth onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary-brand" size="md" fullWidth onClick={() => setOpen(false)}>
                Save changes
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 py-4">
            <p className="text-base text-text-secondary">
              This is the scrollable content area of the dialog. You can place any form fields,
              tables, or rich content here.
            </p>
            <div className="h-[1px] bg-neutral-p80" />
            <p className="text-base text-text-tertiary">
              The content area scrolls independently when the dialog has a fixed height (md/lg sizes).
            </p>
          </div>
        </Dialog>
      </>
    );
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: StoryObj = {
  name: 'Sizes',
  render: () => {
    const [size, setSize] = useState<DialogSize | null>(null);

    const sizeConfig: { size: DialogSize; label: string; description: string }[] = [
      { size: 'sm', label: 'Small (600px)', description: 'Auto height — ideal for confirmations, short forms, and alerts.' },
      { size: 'md', label: 'Medium (720px)', description: 'Fixed 600px height with scrollable content — good for medium-length forms.' },
      { size: 'lg', label: 'Large (960px)', description: 'Fixed 800px height with scrollable content — good for tables and rich editors.' },
    ];

    return (
      <>
        <div className="flex gap-3 flex-wrap">
          {sizeConfig.map(({ size: s, label }) => (
            <TriggerButton key={s} label={label} onClick={() => setSize(s)} />
          ))}
        </div>

        {sizeConfig.map(({ size: s, description }) => (
          <Dialog
            key={s}
            open={size === s}
            onClose={() => setSize(null)}
            size={s}
            title="Heading text"
            description={description}
            footer={
              <div className="flex gap-3 justify-end">
                <Button variant="secondary-neutral" size="md" onClick={() => setSize(null)}>
                  Cancel
                </Button>
                <Button variant="primary-brand" size="md" onClick={() => setSize(null)}>
                  Confirm
                </Button>
              </div>
            }
          >
            <div className="py-4 flex flex-col gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-background-secondary rounded-[8px] flex items-center px-3">
                  <span className="text-sm text-text-quaternary">Content row {i + 1}</span>
                </div>
              ))}
            </div>
          </Dialog>
        ))}
      </>
    );
  },
};

// ─── No Header ────────────────────────────────────────────────────────────────

export const NoHeader: StoryObj = {
  name: 'No Header',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton label="Open (no header)" onClick={() => setOpen(true)} />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          showHeader={false}
          footer={
            <Button variant="primary-brand" size="md" fullWidth onClick={() => setOpen(false)}>
              Got it
            </Button>
          }
        >
          <div className="py-2 text-center">
            <p className="text-base text-text-secondary">
              A dialog without a header — content fills top area directly.
            </p>
          </div>
        </Dialog>
      </>
    );
  },
};

// ─── No Footer ────────────────────────────────────────────────────────────────

export const NoFooter: StoryObj = {
  name: 'No Footer',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton label="Open (no footer)" onClick={() => setOpen(true)} />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Read-only content"
          description="Close with the X button or press Escape."
        >
          <div className="py-4 text-base text-text-secondary leading-6">
            This dialog has no footer. The X button and Escape key are the only ways to dismiss it.
          </div>
        </Dialog>
      </>
    );
  },
};

// ─── Confirmation Dialog — All Types ──────────────────────────────────────────

export const ConfirmationTypes: StoryObj<ConfirmationDialogProps> = {
  name: 'Confirmation — All Types',
  render: () => {
    const [type, setType] = useState<ConfirmDialogType | null>(null);

    const configs: { type: ConfirmDialogType; label: string; description: string; confirmLabel: string }[] = [
      {
        type: 'default',
        label: 'Default (info)',
        description: "You're about to make changes. This action will apply to all selected items.",
        confirmLabel: 'Yes, Continue',
      },
      {
        type: 'error',
        label: 'Error (destructive)',
        description: 'This will permanently delete the item. This action cannot be undone.',
        confirmLabel: 'Yes, Delete',
      },
      {
        type: 'success',
        label: 'Success',
        description: 'Everything looks good. Ready to proceed?',
        confirmLabel: 'Yes, Proceed',
      },
    ];

    return (
      <>
        <div className="flex gap-3 flex-wrap">
          {configs.map(({ type: t, label }) => (
            <TriggerButton key={t} label={label} onClick={() => setType(t)} />
          ))}
        </div>

        {configs.map(({ type: t, description, confirmLabel }) => (
          <ConfirmationDialog
            key={t}
            open={type === t}
            type={t}
            title="Are you sure?"
            description={description}
            confirmLabel={confirmLabel}
            cancelLabel="No, Cancel"
            onClose={() => setType(null)}
            onCancel={() => setType(null)}
            onConfirm={() => { alert(`Confirmed: ${t}`); setType(null); }}
          />
        ))}
      </>
    );
  },
};

// ─── Confirmation — Playground ────────────────────────────────────────────────

export const ConfirmationPlayground: StoryObj<ConfirmationDialogProps> = {
  name: 'Confirmation — Playground',
  args: {
    type:         'default',
    title:        'Are you sure?',
    description:  "Sorry, the page you are looking for doesn't exist or has been moved.",
    confirmLabel: 'Yes, Continue!',
    cancelLabel:  'No',
    hideCancel:   false,
    confirmLoading:  false,
    confirmDisabled: false,
  },
  argTypes: {
    type:           { control: 'radio', options: ['default', 'error', 'success'] as ConfirmDialogType[] },
    title:          { control: 'text' },
    description:    { control: 'text' },
    confirmLabel:   { control: 'text' },
    cancelLabel:    { control: 'text' },
    hideCancel:     { control: 'boolean' },
    confirmLoading: { control: 'boolean' },
    confirmDisabled:{ control: 'boolean' },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton label="Open Confirmation" onClick={() => setOpen(true)} />
        <ConfirmationDialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          onConfirm={() => { alert('Confirmed!'); setOpen(false); }}
        />
      </>
    );
  },
};

// ─── Confirmation — Loading State ─────────────────────────────────────────────

export const ConfirmationLoading: StoryObj = {
  name: 'Confirmation — Loading',
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => { setLoading(false); setOpen(false); }, 2000);
    };

    return (
      <>
        <TriggerButton label="Open (with async confirm)" onClick={() => setOpen(true)} />
        <ConfirmationDialog
          open={open}
          type="error"
          title="Delete this record?"
          description="This will permanently remove all associated data. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Keep it"
          confirmLoading={loading}
          confirmDisabled={loading}
          onClose={loading ? undefined : () => setOpen(false)}
          onCancel={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      </>
    );
  },
};

// ─── Dialog — Large with form ─────────────────────────────────────────────────

export const LargeWithForm: StoryObj = {
  name: 'Large — With Form Content',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <TriggerButton label="Open Large Dialog" onClick={() => setOpen(true)} />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          title="Edit profile"
          description="Update your profile information. Changes will be visible to other users."
          footer={
            <div className="flex gap-3 justify-end">
              <Button variant="secondary-neutral" size="md" onClick={() => setOpen(false)}>
                Discard changes
              </Button>
              <Button variant="primary-brand" size="md" onClick={() => setOpen(false)}>
                Save changes
              </Button>
            </div>
          }
        >
          <div className="py-6 flex flex-col gap-5">
            {['First name', 'Last name', 'Email address', 'Phone number', 'Company', 'Role', 'Department', 'Bio'].map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">{field}</label>
                <input
                  type="text"
                  placeholder={`Enter ${field.toLowerCase()}`}
                  className="h-10 px-3 border border-neutral-p80 rounded-[8px] text-sm text-text-secondary outline-none focus:border-primary focus:shadow-[0_0_0_3px_#CCEFD9] transition-[border-color,box-shadow] duration-150"
                />
              </div>
            ))}
          </div>
        </Dialog>
      </>
    );
  },
};
