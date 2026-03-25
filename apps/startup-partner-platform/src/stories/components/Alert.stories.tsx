import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert, Button } from '@/design-system';
import type { AlertProps, AlertType, AlertVariant } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/Alert',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Alert** — Allkons Design System

Sources:
- [Figma: Alert](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002769-82899)
- [Figma: Toast/M (Alert + Banner)](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002777-85018)

\`\`\`tsx
// Inline card alert
<Alert
  type="error"
  title="Error Text"
  description="This is an error message about copywriting."
  actions={<Button variant="link-error" size="sm">View details</Button>}
  onClose={() => {}}
/>

// Full-width banner
<Alert
  variant="banner"
  type="success"
  title="Changes saved successfully."
  actions={<Button variant="link-neutral" size="sm">Undo</Button>}
  onClose={() => {}}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPES: AlertType[] = ['error', 'info', 'warning', 'success'];

const TYPE_LABELS: Record<AlertType, string> = {
  error:   'Error Text',
  info:    'Informational Notes',
  warning: 'Warning',
  success: 'Success Tips',
};

const TYPE_DESCRIPTIONS: Record<AlertType, string> = {
  error:   'This is an error message about copywriting.',
  info:    'Additional description and information about copywriting.',
  warning: 'This is a warning notice about copywriting.',
  success: 'Detailed description and advice about successful copywriting.',
};

const AlertActions = ({ type }: { type: AlertType }) => (
  <>
    <Button variant="link-neutral" size="sm">Missing</Button>
    <Button
      variant={type === 'error' ? 'link-error' : 'link-neutral'}
      size="sm"
    >
      View details →
    </Button>
  </>
);

const UndoAction = () => (
  <Button variant="link-neutral" size="sm">Undo</Button>
);

// ─── All Types — Title only ────────────────────────────────────────────────────

export const AllTypes: StoryObj = {
  name: 'Alert — All Types',
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPES.map((type) => (
        <Alert
          key={type}
          type={type}
          title={TYPE_LABELS[type]}
          actions={<UndoAction />}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── All Types — With description ─────────────────────────────────────────────

export const AllTypesWithDescription: StoryObj = {
  name: 'Alert — All Types With Description',
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPES.map((type) => (
        <Alert
          key={type}
          type={type}
          title={TYPE_LABELS[type]}
          description={TYPE_DESCRIPTIONS[type]}
          actions={<AlertActions type={type} />}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── No close button ──────────────────────────────────────────────────────────

export const NoClose: StoryObj = {
  name: 'Alert — No Close Button',
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPES.map((type) => (
        <Alert
          key={type}
          type={type}
          title={TYPE_LABELS[type]}
          description={TYPE_DESCRIPTIONS[type]}
          actions={<AlertActions type={type} />}
        />
      ))}
    </div>
  ),
};

// ─── No icon ──────────────────────────────────────────────────────────────────

export const NoIcon: StoryObj = {
  name: 'Alert — No Icon',
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPES.map((type) => (
        <Alert
          key={type}
          type={type}
          title={TYPE_LABELS[type]}
          description={TYPE_DESCRIPTIONS[type]}
          showIcon={false}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── Title only (no description, no actions) ──────────────────────────────────

export const TitleOnly: StoryObj = {
  name: 'Alert — Title Only',
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPES.map((type) => (
        <Alert
          key={type}
          type={type}
          title={TYPE_LABELS[type]}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── Dismissible (stateful) ───────────────────────────────────────────────────

export const Dismissible: StoryObj = {
  name: 'Alert — Dismissible',
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) {
      return (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-text-tertiary">Alert dismissed.</p>
          <Button variant="secondary-neutral" size="sm" onClick={() => setVisible(true)}>
            Show again
          </Button>
        </div>
      );
    }
    return (
      <Alert
        type="error"
        title="Error Text"
        description="This is an error message about copywriting."
        actions={<AlertActions type="error" />}
        onClose={() => setVisible(false)}
      />
    );
  },
};

// ─── Banner — All Types (no description) ──────────────────────────────────────

export const BannerAllTypes: StoryObj = {
  name: 'Banner — All Types',
  render: () => (
    <div className="flex flex-col gap-2 -mx-6">
      {TYPES.map((type) => (
        <Alert
          key={type}
          variant="banner"
          type={type}
          title={TYPE_LABELS[type]}
          actions={<UndoAction />}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── Banner — With description ────────────────────────────────────────────────

export const BannerWithDescription: StoryObj = {
  name: 'Banner — With Description',
  render: () => (
    <div className="flex flex-col gap-2 -mx-6">
      {TYPES.map((type) => (
        <Alert
          key={type}
          variant="banner"
          type={type}
          title={TYPE_LABELS[type]}
          description={TYPE_DESCRIPTIONS[type]}
          actions={<AlertActions type={type} />}
          onClose={() => {}}
        />
      ))}
    </div>
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<AlertProps> = {
  name: 'Playground',
  args: {
    type:        'info',
    variant:     'alert',
    title:       'Informational Notes',
    description: 'Additional description and information about copywriting.',
    showIcon:    true,
  },
  argTypes: {
    type:        { control: 'radio', options: ['error', 'warning', 'success', 'info'] as AlertType[] },
    variant:     { control: 'radio', options: ['alert', 'banner'] as AlertVariant[] },
    title:       { control: 'text' },
    description: { control: 'text' },
    showIcon:    { control: 'boolean' },
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    if (!open) {
      return (
        <Button variant="secondary-neutral" size="sm" onClick={() => setOpen(true)}>
          Reopen
        </Button>
      );
    }
    return (
      <Alert
        {...args}
        actions={
          <>
            <Button variant="link-neutral" size="sm">Missing</Button>
            <Button variant="link-neutral" size="sm">View details →</Button>
          </>
        }
        onClose={() => setOpen(false)}
      />
    );
  },
};
