import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Breadcrumbs } from '@/design-system';
import type { BreadcrumbsProps, BreadcrumbColor, BreadcrumbDivider, BreadcrumbType } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/Breadcrumbs',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Breadcrumbs** — Allkons Design System

Sources:
- [Figma: BreadcrumbButtonBase](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001772-8447)
- [Figma: Breadcrumbs](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001780-11712)

\`\`\`tsx
<Breadcrumbs
  items={[
    { label: 'Home', onClick: () => router.push('/') },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops' },
  ]}
  color="brand"
  divider="chevron"
  type="text"
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Sample data ──────────────────────────────────────────────────────────────

const ITEMS_SHORT = [
  { label: 'Home',     onClick: () => {} },
  { label: 'Products', onClick: () => {} },
  { label: 'Laptops' },
];

const ITEMS_LONG = [
  { label: 'Home',        onClick: () => {} },
  { label: 'Path level 1', onClick: () => {} },
  { label: 'Path level 2', onClick: () => {} },
  { label: 'Path level 3', onClick: () => {} },
  { label: 'Path level 4', onClick: () => {} },
  { label: 'Path level 5' },
];

const ITEMS_WITH_HREF = [
  { label: 'Home',        href: '/' },
  { label: 'Path level 1', href: '/level-1' },
  { label: 'Path level 2', href: '/level-1/level-2' },
  { label: 'Path level 3' },
];

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: StoryObj = {
  name: 'All Variants',
  render: () => (
    <div className="flex flex-col gap-8">

      {/* Text + Chevron */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Text · Chevron</p>
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="chevron" type="text" />
          <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="chevron" type="text" />
        </div>
      </div>

      {/* Text + Slash */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Text · Slash</p>
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="slash" type="text" />
          <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="slash" type="text" />
        </div>
      </div>

      {/* Button + Chevron */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Button · Chevron</p>
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="chevron" type="button" />
          <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="chevron" type="button" />
        </div>
      </div>

      {/* Button + Slash */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Button · Slash</p>
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="slash" type="button" />
          <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="slash" type="button" />
        </div>
      </div>

    </div>
  ),
};

// ─── Text · Chevron ───────────────────────────────────────────────────────────

export const TextChevron: StoryObj = {
  name: 'Text · Chevron',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="chevron" type="text" />
      <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="chevron" type="text" />
    </div>
  ),
};

// ─── Text · Slash ─────────────────────────────────────────────────────────────

export const TextSlash: StoryObj = {
  name: 'Text · Slash',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="slash" type="text" />
      <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="slash" type="text" />
    </div>
  ),
};

// ─── Button · Chevron ─────────────────────────────────────────────────────────

export const ButtonChevron: StoryObj = {
  name: 'Button · Chevron',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="chevron" type="button" />
      <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="chevron" type="button" />
    </div>
  ),
};

// ─── Button · Slash ───────────────────────────────────────────────────────────

export const ButtonSlash: StoryObj = {
  name: 'Button · Slash',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_LONG} color="brand"   divider="slash" type="button" />
      <Breadcrumbs items={ITEMS_LONG} color="neutral" divider="slash" type="button" />
    </div>
  ),
};

// ─── Short (3 items) ──────────────────────────────────────────────────────────

export const Short: StoryObj = {
  name: 'Short (3 items)',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_SHORT} color="brand"   divider="chevron" type="text" />
      <Breadcrumbs items={ITEMS_SHORT} color="brand"   divider="chevron" type="button" />
      <Breadcrumbs items={ITEMS_SHORT} color="neutral" divider="slash"   type="text" />
      <Breadcrumbs items={ITEMS_SHORT} color="neutral" divider="slash"   type="button" />
    </div>
  ),
};

// ─── With href links ──────────────────────────────────────────────────────────

export const WithHrefLinks: StoryObj = {
  name: 'With href Links',
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={ITEMS_WITH_HREF} color="brand"   divider="chevron" type="text" />
      <Breadcrumbs items={ITEMS_WITH_HREF} color="brand"   divider="chevron" type="button" />
      <Breadcrumbs items={ITEMS_WITH_HREF} color="neutral" divider="slash"   type="text" />
    </div>
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<BreadcrumbsProps> = {
  name: 'Playground',
  args: {
    color:   'brand',
    divider: 'chevron',
    type:    'text',
  },
  argTypes: {
    color:   { control: 'radio', options: ['brand', 'neutral'] as BreadcrumbColor[] },
    divider: { control: 'radio', options: ['chevron', 'slash']  as BreadcrumbDivider[] },
    type:    { control: 'radio', options: ['text', 'button']    as BreadcrumbType[] },
  },
  render: (args) => (
    <Breadcrumbs
      {...args}
      items={ITEMS_LONG}
    />
  ),
};
