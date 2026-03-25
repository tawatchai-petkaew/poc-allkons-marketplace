import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageHeader, Button } from '@/design-system';
import type { PageHeaderProps, PageHeaderType } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/PageHeader',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**PageHeader** — Allkons Design System

Source: [Figma: Page Header](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001934-25857)

\`\`\`tsx
<PageHeader
  title="Team members"
  description="Manage your team members and their account permissions here."
  breadcrumbs={[
    { label: 'Path level 1', onClick: () => {} },
    { label: '...' },
    { label: 'Path level 3' },
  ]}
  goBack={{ onClick: () => {} }}
  actions={<Button variant="primary-brand">Add member</Button>}
  searchBar={<input placeholder="Search..." />}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BREADCRUMBS = [
  { label: 'Path level 1', onClick: () => {} },
  { label: '...' },
  { label: 'Path level 3' },
];

const SearchInput = () => (
  <div className="flex items-center gap-2 h-10 px-4 border border-neutral-p80 rounded-lg w-full">
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-text-placeholder shrink-0">
      <path d="M17.5 17.5l-3.333-3.333M14.167 8.75a5.417 5.417 0 1 1-10.834 0 5.417 5.417 0 0 1 10.834 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span className="text-base text-text-placeholder">Search</span>
  </div>
);

const SampleActions = () => (
  <>
    <Button variant="tertiary-neutral" size="md">Tertiary</Button>
    <Button variant="secondary-neutral" size="md">Secondary</Button>
    <Button variant="secondary-brand" size="md">Secondary</Button>
    <Button variant="primary-brand" size="md">Primary</Button>
  </>
);

// ─── Simple — Full featured ────────────────────────────────────────────────────

export const SimpleFullFeatured: StoryObj<PageHeaderProps> = {
  name: 'Simple — Full Featured',
  render: () => (
    <PageHeader
      type="simple"
      breadcrumbs={BREADCRUMBS}
      goBack={{ onClick: () => alert('Back!') }}
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={<SampleActions />}
      searchBar={<SearchInput />}
    />
  ),
};

// ─── Simple — Title only ───────────────────────────────────────────────────────

export const SimpleTitleOnly: StoryObj = {
  name: 'Simple — Title Only',
  render: () => (
    <PageHeader
      title="Team members"
      description="Manage your team members and their account permissions here."
    />
  ),
};

// ─── Simple — With actions ─────────────────────────────────────────────────────

export const SimpleWithActions: StoryObj = {
  name: 'Simple — With Actions',
  render: () => (
    <PageHeader
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Export</Button>
          <Button variant="primary-brand" size="md">Add member</Button>
        </>
      }
    />
  ),
};

// ─── Simple — With search ──────────────────────────────────────────────────────

export const SimpleWithSearch: StoryObj = {
  name: 'Simple — With Search',
  render: () => (
    <PageHeader
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Export</Button>
          <Button variant="primary-brand" size="md">Add member</Button>
        </>
      }
      searchBar={<SearchInput />}
    />
  ),
};

// ─── Simple — With badge ──────────────────────────────────────────────────────

export const SimpleWithBadge: StoryObj = {
  name: 'Simple — With Badge',
  render: () => (
    <PageHeader
      title="Team members"
      description="Manage your team members and their account permissions here."
      badge={
        <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-sm text-primary-text bg-primary-subtle border border-[#99dfb4]">
          ✓ ยืนยันตัวตนแล้ว
        </span>
      }
      actions={<Button variant="primary-brand" size="md">Add member</Button>}
    />
  ),
};

// ─── Simple — No divider ──────────────────────────────────────────────────────

export const SimpleNoDivider: StoryObj = {
  name: 'Simple — No Divider',
  render: () => (
    <PageHeader
      title="Team members"
      description="No bottom divider."
      divider={false}
      actions={<Button variant="primary-brand" size="md">Add member</Button>}
    />
  ),
};

// ─── Avatar Type ──────────────────────────────────────────────────────────────

export const AvatarType: StoryObj = {
  name: 'Avatar Type',
  render: () => (
    <PageHeader
      type="avatar"
      breadcrumbs={BREADCRUMBS}
      goBack={{ onClick: () => alert('Back!') }}
      avatar={{ name: 'Display name', email: 'address@email.com' }}
      actions={<SampleActions />}
      searchBar={<SearchInput />}
    />
  ),
};

// ─── Avatar — With image ──────────────────────────────────────────────────────

export const AvatarWithImage: StoryObj = {
  name: 'Avatar — With Image',
  render: () => (
    <PageHeader
      type="avatar"
      goBack={{ onClick: () => alert('Back!') }}
      avatar={{
        name: 'John Doe',
        email: 'john.doe@example.com',
        src: 'https://i.pravatar.cc/64?img=3',
      }}
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Edit</Button>
          <Button variant="primary-brand" size="md">Send message</Button>
        </>
      }
    />
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<PageHeaderProps> = {
  name: 'Playground',
  args: {
    type: 'simple',
    title: 'Team members',
    description: 'Manage your team members and their account permissions here.',
    divider: true,
  },
  argTypes: {
    type: { control: 'radio', options: ['simple', 'avatar'] as PageHeaderType[] },
    title: { control: 'text' },
    description: { control: 'text' },
    divider: { control: 'boolean' },
  },
  render: (args) => (
    <PageHeader
      {...args}
      breadcrumbs={BREADCRUMBS}
      goBack={{ onClick: () => {} }}
      avatar={{ name: 'Display name', email: 'address@email.com' }}
      actions={
        <>
          <Button variant="secondary-neutral" size="md">Cancel</Button>
          <Button variant="primary-brand" size="md">Save</Button>
        </>
      }
      searchBar={<SearchInput />}
    />
  ),
};
