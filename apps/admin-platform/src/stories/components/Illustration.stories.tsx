import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Illustration } from '@/design-system';
import type { IllustrationProps, IllustrationType } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<IllustrationProps> = {
  title: 'Design System/Components/Illustration',
  component: Illustration,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Illustration** — Allkons Design System

Source: [Figma DS1 → Illustration/Graphic](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=257-7832)

38 illustrations available, 160×160px intrinsic size. SVGs stored at \`public/images/illustrations/{type}.svg\`.

\`\`\`tsx
<Illustration type="cart" size={160} />
<Illustration type="server" size={120} />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    type: { control: 'select' },
    size: { control: { type: 'range', min: 40, max: 320, step: 8 } },
  },
  args: {
    type: 'cart',
    size: 160,
  },
};

export default meta;
type Story = StoryObj<IllustrationProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {children}
    </div>
  </div>
);

const Tile = ({ type }: { type: IllustrationType }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 120 }}>
    <Illustration type={type} size={96} />
    <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-word' }}>
      {type}
    </span>
  </div>
);

// ─── Groups (only types with SVG files in public/images/illustrations/) ───────

const ECOMMERCE_TYPES: IllustrationType[] = [
  'cart', 'cart-plus', 'cart-search',
  'shopping-bag-1', 'shopping-bag-2', 'shopping-bag-heart',
  'store', 'store-heart', 'store-search',
  'credit-card', 'credit-card-chart-01', 'credit-card-chart-02',
  'credit-check', 'bill-check', 'bill-clock', 'arrow-bill', 'qr-bill', 'car-clock',
];

const LOCATION_TYPES: IllustrationType[] = [
  'location', 'add-location', 'map-pin',
];

const DOCS_TYPES: IllustrationType[] = [
  'docs-boq', 'docs-boq-check', 'docs-check',
];

const APP_TYPES: IllustrationType[] = [
  'app', 'app-dual', 'app-dual-with-ai', 'paint-brush', 'image',
  'compare', 'add-compare', 'chat-search', 'category',
];

const USER_TYPES: IllustrationType[] = [
  'user-group', 'users-setting',
];

const SYSTEM_TYPES: IllustrationType[] = [
  'server', 'cloud-off', 'cookie',
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
};

export const AllIllustrations: Story = {
  name: 'All Illustrations',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Illustrations</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        38 illustrations · 160×160px · Figma: Illustration/Graphic
      </p>

      <Section title="E-commerce">
        {ECOMMERCE_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>

      <Section title="Location">
        {LOCATION_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>

      <Section title="Documents">
        {DOCS_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>

      <Section title="App / Tools">
        {APP_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>

      <Section title="Users">
        {USER_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>

      <Section title="System / Misc">
        {SYSTEM_TYPES.map(t => <Tile key={t} type={t} />)}
      </Section>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 32 }}>Sizes</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
        {([40, 64, 80, 96, 120, 160, 200] as const).map(size => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Illustration type="cart" size={size} />
            <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace' }}>{size}px</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
