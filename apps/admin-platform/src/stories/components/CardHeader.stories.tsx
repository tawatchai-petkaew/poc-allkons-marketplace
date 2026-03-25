import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardHeader, Button } from '@/design-system';
import type { CardHeaderProps, CardHeaderSize, CardHeaderType } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/CardHeader',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**CardHeader** — Allkons Design System

Source: [Figma: Card Header](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002738-50639)

\`\`\`tsx
<CardHeader
  size="md"
  title="Team members"
  description="Manage your team members and their account permissions here."
  badge={<Badge>Label</Badge>}
  actions={<Button variant="primary-brand">Add member</Button>}
  dropdown={true}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NeutralBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center h-6 px-2 rounded-full text-sm text-neutral-60 bg-neutral-p95 border border-neutral-p80">
    {children}
  </span>
);

const SampleActions = () => (
  <>
    <Button variant="tertiary-neutral" size="md">Tertiary</Button>
    <Button variant="secondary-neutral" size="md">Secondary</Button>
    <Button variant="secondary-brand" size="md">Secondary</Button>
    <Button variant="primary-brand" size="md">Primary</Button>
  </>
);

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: StoryObj = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-col gap-10">
      {(['md', 'sm', 'xs'] as CardHeaderSize[]).map((size) => (
        <div key={size}>
          <p className="text-xs text-text-quaternary mb-3 uppercase tracking-wide">{size}</p>
          <CardHeader
            size={size}
            title="Team members"
            description="Manage your team members and their account permissions here."
            badge={<NeutralBadge>Label</NeutralBadge>}
            actions={<SampleActions />}
            dropdown={true}
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Simple — Medium Default ──────────────────────────────────────────────────

export const SimpleMedium: StoryObj = {
  name: 'Simple — Medium',
  render: () => (
    <CardHeader
      size="md"
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={<SampleActions />}
      dropdown={true}
    />
  ),
};

// ─── Simple — Small ───────────────────────────────────────────────────────────

export const SimpleSmall: StoryObj = {
  name: 'Simple — Small',
  render: () => (
    <CardHeader
      size="sm"
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={<SampleActions />}
      dropdown={true}
    />
  ),
};

// ─── Simple — Extra Small ─────────────────────────────────────────────────────

export const SimpleExtraSmall: StoryObj = {
  name: 'Simple — Extra Small',
  render: () => (
    <CardHeader
      size="xs"
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={<SampleActions />}
      dropdown={true}
    />
  ),
};

// ─── With Badge ───────────────────────────────────────────────────────────────

export const WithBadge: StoryObj = {
  name: 'With Badge',
  render: () => (
    <CardHeader
      size="md"
      title="Team members"
      description="Manage your team members and their account permissions here."
      badge={<NeutralBadge>42</NeutralBadge>}
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Export</Button>
          <Button variant="primary-brand" size="md">Add member</Button>
        </>
      }
      dropdown={true}
    />
  ),
};

// ─── With Swap Content ────────────────────────────────────────────────────────

export const WithSwapContent: StoryObj = {
  name: 'With Swap Content (Left Image)',
  render: () => (
    <CardHeader
      size="md"
      title="Team members"
      description="Manage your team members and their account permissions here."
      swapContent={
        <div className="w-14 h-14 rounded-lg bg-background-secondary border border-neutral-p80 flex items-center justify-center text-text-quaternary text-xl">
          🖼
        </div>
      }
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Cancel</Button>
          <Button variant="primary-brand" size="md">Save</Button>
        </>
      }
      dropdown={true}
    />
  ),
};

// ─── Avatar Type ──────────────────────────────────────────────────────────────

export const AvatarType: StoryObj = {
  name: 'Avatar Type',
  render: () => (
    <CardHeader
      size="md"
      type="avatar"
      avatar={{ name: 'Display name', email: 'address@email.com' }}
      actions={<SampleActions />}
      dropdown={true}
    />
  ),
};

// ─── Avatar — With image ──────────────────────────────────────────────────────

export const AvatarWithImage: StoryObj = {
  name: 'Avatar — With Image',
  render: () => (
    <CardHeader
      size="md"
      type="avatar"
      avatar={{
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        src: 'https://i.pravatar.cc/64?img=5',
      }}
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Edit</Button>
          <Button variant="primary-brand" size="md">Send message</Button>
        </>
      }
      dropdown={true}
    />
  ),
};

// ─── No Actions ───────────────────────────────────────────────────────────────

export const NoActions: StoryObj = {
  name: 'No Actions',
  render: () => (
    <CardHeader
      size="md"
      title="Team members"
      description="This header has no action buttons."
    />
  ),
};

// ─── No Divider ───────────────────────────────────────────────────────────────

export const NoDivider: StoryObj = {
  name: 'No Divider',
  render: () => (
    <CardHeader
      size="md"
      title="Team members"
      description="No bottom divider."
      divider={false}
      actions={<Button variant="primary-brand" size="md">Action</Button>}
      dropdown={true}
    />
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<CardHeaderProps> = {
  name: 'Playground',
  args: {
    size: 'md',
    type: 'simple',
    title: 'Team members',
    description: 'Manage your team members and their account permissions here.',
    divider: true,
  },
  argTypes: {
    size: { control: 'radio', options: ['md', 'sm', 'xs'] as CardHeaderSize[] },
    type: { control: 'radio', options: ['simple', 'avatar'] as CardHeaderType[] },
    title: { control: 'text' },
    description: { control: 'text' },
    divider: { control: 'boolean' },
  },
  render: (args) => (
    <CardHeader
      {...args}
      avatar={{ name: 'Display name', email: 'address@email.com' }}
      badge={<NeutralBadge>Label</NeutralBadge>}
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Cancel</Button>
          <Button variant="primary-brand" size="md">Save</Button>
        </>
      }
      dropdown={true}
    />
  ),
};
