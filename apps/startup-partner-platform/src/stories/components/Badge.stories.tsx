import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '@/design-system';
import type { BadgeProps, BadgeShape, BadgeVariant, BadgeColor } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<BadgeProps> = {
  title: 'Design System/Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Badge** — Allkons Design System

Source: [Figma DS1 → Badge](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001675-11478)

\`\`\`tsx
<Badge color="brand" variant="ghost">Label</Badge>
<Badge color="error" variant="solid" shape="badge">Label</Badge>
<Badge color="success" dot>Active</Badge>
<Badge color="gray" onDismiss={() => {}}>Dismiss</Badge>
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    shape:   { control: 'radio',  options: ['pill', 'badge'] as BadgeShape[] },
    variant: { control: 'radio',  options: ['ghost', 'outline', 'solid'] as BadgeVariant[] },
    color:   { control: 'select', options: ['gray', 'brand', 'error', 'success', 'warning', 'info', 'purple'] as BadgeColor[] },
    dot:     { control: 'boolean' },
    onDismiss: { control: false },
  },
  args: {
    children: 'Label',
    shape:    'pill',
    variant:  'ghost',
    color:    'gray',
  },
};

export default meta;
type Story = StoryObj<BadgeProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS:   BadgeColor[]   = ['gray', 'brand', 'error', 'success', 'warning', 'info', 'purple'];
const VARIANTS: BadgeVariant[] = ['ghost', 'outline', 'solid'];
const SHAPES:   BadgeShape[]   = ['pill', 'badge'];

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
      {title}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>{title}</h3>
    {children}
  </div>
);

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Badge</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        shape × variant × color — 2 shapes · 3 variants · 7 colors
      </p>

      {SHAPES.map(shape => (
        <Section key={shape} title={`Shape: ${shape}`}>
          {VARIANTS.map(variant => (
            <Row key={variant} title={`variant="${variant}"`}>
              {COLORS.map(color => (
                <Badge key={color} shape={shape} variant={variant} color={color}>
                  {color}
                </Badge>
              ))}
            </Row>
          ))}
        </Section>
      ))}
    </div>
  ),
};

// ─── Inline icon samples for leadingIcon stories ──────────────────────────────

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
    <path d="M5 1l1.12 2.27L9 3.64 7 5.59l.47 2.74L5 7.01 2.53 8.33 3 5.59 1 3.64l2.88-.37L5 1z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1.5 5.5L4 8l4.5-6" />
  </svg>
);

const LightningIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
    <path d="M6 1L2 6h3.5L4 9l4-5H4.5L6 1z" />
  </svg>
);

export const WithLeadingIcon: Story = {
  name: 'With Leading Icon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Leading Icon</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>leadingIcon prop — pass any ReactNode (SVG, Remixicon, etc.)</p>

      {VARIANTS.map(variant => (
        <Row key={variant} title={`variant="${variant}"`}>
          {COLORS.map(color => (
            <Badge key={color} shape="pill" variant={variant} color={color} leadingIcon={<StarIcon />}>
              {color}
            </Badge>
          ))}
        </Row>
      ))}

      <Row title="mixed icons">
        <Badge color="brand"   leadingIcon={<StarIcon />}>Star</Badge>
        <Badge color="success" leadingIcon={<CheckIcon />}>Check</Badge>
        <Badge color="warning" leadingIcon={<LightningIcon />}>Lightning</Badge>
        <Badge color="error"   leadingIcon={<CheckIcon />} onDismiss={() => {}}>Dismiss too</Badge>
      </Row>
    </div>
  ),
};

export const WithDot: Story = {
  name: 'With Dot',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Dot Prefix</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>dot prop — colored circle matches variant color</p>

      {VARIANTS.map(variant => (
        <Row key={variant} title={`variant="${variant}"`}>
          {COLORS.map(color => (
            <Badge key={color} shape="pill" variant={variant} color={color} dot>
              {color}
            </Badge>
          ))}
        </Row>
      ))}
    </div>
  ),
};

export const Dismissible: Story = {
  name: 'Dismissible (×)',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Dismissible</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>onDismiss prop — renders × button on right</p>

      {VARIANTS.map(variant => (
        <Row key={variant} title={`variant="${variant}"`}>
          {COLORS.map(color => (
            <Badge key={color} shape="pill" variant={variant} color={color} onDismiss={() => {}}>
              {color}
            </Badge>
          ))}
        </Row>
      ))}
    </div>
  ),
};

export const DotAndDismiss: Story = {
  name: 'Dot + Dismiss',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Dot + Dismiss</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>dot + onDismiss combined</p>

      <Row title="ghost">
        {COLORS.map(color => (
          <Badge key={color} color={color} dot onDismiss={() => {}}>
            {color}
          </Badge>
        ))}
      </Row>
    </div>
  ),
};

export const Shapes: Story = {
  name: 'Shape: Pill vs Badge',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Shape</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>pill = rounded-full · badge = rounded-sm (4px)</p>

      {VARIANTS.map(variant => (
        <Row key={variant} title={`variant="${variant}"`}>
          {SHAPES.map(shape =>
            COLORS.slice(0, 4).map(color => (
              <Badge key={`${shape}-${color}`} shape={shape} variant={variant} color={color}>
                {shape}
              </Badge>
            ))
          )}
        </Row>
      ))}
    </div>
  ),
};
