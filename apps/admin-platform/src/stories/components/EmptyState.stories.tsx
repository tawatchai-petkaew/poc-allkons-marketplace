import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyState, EmptyIllustration } from '@/design-system';
import type { EmptyStateProps, EmptyIllustrationType, EmptyIllustrationColor } from '@/design-system';
import { Button } from '@/design-system';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Feature icon — search magnifier (used in Feature icon stories)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/EmptyState',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**EmptyState** — Allkons Design System

Sources:
- [Figma: EmptyIllustration](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001811-4148)
- [Figma: EmptyState](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001811-16517)

\`\`\`tsx
// Illustration mode
<EmptyState
  title="No results found"
  description="Try adjusting your search or filters."
  illustrationType="01"
  illustrationColor="neutral"
  actions={
    <>
      <Button variant="secondary-neutral" size="md">Clear filters</Button>
      <Button variant="primary-brand" size="md">Browse all</Button>
    </>
  }
/>

// Feature icon mode
<EmptyState
  title="No notifications"
  description="You're all caught up!"
  featureIcon={<BellIcon />}
  featureIconVariant="brand"
/>
\`\`\`

> **Note:** Illustration images are loaded from \`/public/images/illustrations/empty-{type}-{color}.svg\`.
> Add the following files to \`public/images/illustrations/\`:
> \`empty-01-neutral.svg\`, \`empty-01-gradient.svg\`,
> \`empty-02-neutral.svg\`, \`empty-02-gradient.svg\`,
> \`empty-03-neutral.svg\`, \`empty-03-gradient.svg\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Illustration variants ────────────────────────────────────────────────────

export const IllustrationVariants: StoryObj = {
  name: 'EmptyIllustration — All Variants',
  render: () => (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Neutral</p>
        <div className="flex gap-6 flex-wrap">
          {(['01', '02', '03'] as EmptyIllustrationType[]).map((type) => (
            <div key={type} className="flex flex-col items-center gap-2">
              <EmptyIllustration type={type} color="neutral" size={120} />
              <span className="text-xs text-text-quinary">Type {type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Gradient</p>
        <div className="flex gap-6 flex-wrap">
          {(['01', '02', '03'] as EmptyIllustrationType[]).map((type) => (
            <div key={type} className="flex flex-col items-center gap-2">
              <EmptyIllustration type={type} color="gradient" size={120} />
              <span className="text-xs text-text-quinary">Type {type}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: StoryObj = {
  name: 'Sizes — sm / md / lg',
  render: () => (
    <div className="flex flex-col gap-12">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Small (160px illustration)</p>
        <div className="max-w-xs">
          <EmptyState
            size="sm"
            title="No results found"
            description="Try adjusting your search or filter to find what you're looking for."
            actions={
              <>
                <Button variant="secondary-neutral" size="sm">Clear filters</Button>
                <Button variant="primary-brand" size="sm">Browse all</Button>
              </>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Medium (200px illustration)</p>
        <div className="max-w-sm">
          <EmptyState
            size="md"
            title="No results found"
            description="Try adjusting your search or filter to find what you're looking for."
            actions={
              <>
                <Button variant="secondary-neutral" size="md">Clear filters</Button>
                <Button variant="primary-brand" size="md">Browse all</Button>
              </>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Large (200px illustration)</p>
        <div className="max-w-lg">
          <EmptyState
            size="lg"
            title="No results found"
            description="Try adjusting your search or filter to find what you're looking for."
            actions={
              <>
                <Button variant="secondary-neutral" size="md">Clear filters</Button>
                <Button variant="primary-brand" size="md">Browse all</Button>
              </>
            }
          />
        </div>
      </div>

    </div>
  ),
};

// ─── Feature icon mode ────────────────────────────────────────────────────────

export const FeatureIconMode: StoryObj = {
  name: 'Feature Icon — IconWithRing variants',
  render: () => (
    <div className="flex flex-wrap gap-12">
      {(['gray', 'brand', 'success', 'error', 'warning', 'info'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-3 items-center">
          <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">{variant}</p>
          <EmptyState
            size="md"
            featureIcon={<SearchIcon />}
            featureIconVariant={variant}
            title="Nothing here yet"
            description="Get started by adding your first item."
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Illustration color variants ──────────────────────────────────────────────

export const IllustrationColors: StoryObj = {
  name: 'Illustration — Neutral vs Gradient',
  render: () => (
    <div className="flex gap-12 flex-wrap">
      <div className="flex flex-col gap-3 items-center">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Neutral</p>
        <EmptyState
          size="md"
          illustrationType="01"
          illustrationColor="neutral"
          title="No files uploaded"
          description="Upload your first file to get started."
          actions={<Button variant="primary-brand" size="md">Upload file</Button>}
        />
      </div>
      <div className="flex flex-col gap-3 items-center">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Gradient</p>
        <EmptyState
          size="md"
          illustrationType="01"
          illustrationColor="gradient"
          title="No files uploaded"
          description="Upload your first file to get started."
          actions={<Button variant="primary-brand" size="md">Upload file</Button>}
        />
      </div>
    </div>
  ),
};

// ─── Without actions ──────────────────────────────────────────────────────────

export const WithoutActions: StoryObj = {
  name: 'Without Actions',
  render: () => (
    <div className="flex gap-12 flex-wrap">
      <div className="max-w-xs">
        <EmptyState
          size="md"
          title="All caught up!"
          description="There are no pending notifications."
        />
      </div>
      <div className="max-w-xs">
        <EmptyState
          size="md"
          featureIcon={<SearchIcon />}
          featureIconVariant="brand"
          title="No matches"
          description="We couldn't find anything matching your search."
        />
      </div>
    </div>
  ),
};

// ─── Title only ───────────────────────────────────────────────────────────────

export const TitleOnly: StoryObj = {
  name: 'Title Only',
  render: () => (
    <div className="max-w-xs">
      <EmptyState
        size="md"
        illustrationType="02"
        title="Nothing to show here"
      />
    </div>
  ),
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<EmptyStateProps> = {
  name: 'Playground',
  args: {
    size: 'md',
    illustrationType: '01',
    illustrationColor: 'neutral',
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  argTypes: {
    size:               { control: 'radio', options: ['sm', 'md', 'lg'] },
    illustrationType:   { control: 'radio', options: ['01', '02', '03'] },
    illustrationColor:  { control: 'radio', options: ['neutral', 'gradient'] },
    featureIconVariant: { control: 'radio', options: ['gray', 'brand', 'success', 'error', 'warning', 'info'] },
    title:              { control: 'text' },
    description:        { control: 'text' },
  },
  render: (args) => (
    <div className="flex justify-center p-8">
      <div className="max-w-sm w-full">
        <EmptyState
          {...args}
          actions={
            <>
              <Button variant="secondary-neutral" size="md">Secondary</Button>
              <Button variant="primary-brand" size="md">Primary</Button>
            </>
          }
        />
      </div>
    </div>
  ),
};
