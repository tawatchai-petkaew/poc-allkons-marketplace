import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IconWithRing } from '@/design-system';
import type { IconWithRingProps, IconWithRingVariant } from '@/design-system';

// ─── Demo icon (inline SVG — no external dependency) ──────────────────────────

const StarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<IconWithRingProps> = {
  title: 'Design System/Components/IconWithRing',
  component: IconWithRing,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**IconWithRing** — Allkons Design System

Source: [Figma DS1 → Icon with Ring](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008948-10905)

Concentric-ring background system with 6 semantic color variants.
Accepts **icon** (any ReactNode), **illustration**, or **loading** spinner in the center.

\`\`\`tsx
// Icon from any library
<IconWithRing variant="brand" icon={<CheckIcon />} />

// Illustration
<IconWithRing variant="success" illustration="success" bg />

// Loading state
<IconWithRing variant="info" loading />

// White center (bg=false)
<IconWithRing variant="error" icon={<AlertIcon />} bg={false} />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['gray', 'success', 'brand', 'error', 'info', 'warning'] as IconWithRingVariant[] },
    bg: { control: 'boolean' },
    loading: { control: 'boolean' },
    size: { control: { type: 'range', min: 80, max: 320, step: 8 } },
  },
  args: {
    variant: 'brand',
    bg: true,
    loading: false,
    size: 160,
    icon: <StarIcon />,
  },
};

export default meta;
type Story = StoryObj<IconWithRingProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VARIANTS: IconWithRingVariant[] = ['gray', 'success', 'brand', 'error', 'info', 'warning'];

const VARIANT_ICONS: Record<IconWithRingVariant, React.ReactNode> = {
  gray:    <StarIcon />,
  success: <CheckIcon />,
  brand:   <StarIcon />,
  error:   <AlertIcon />,
  info:    <InfoIcon />,
  warning: <AlertIcon />,
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace', textAlign: 'center' }}>
    {children}
  </span>
);

const Tile = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    {children}
    <Label>{label}</Label>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      {children}
    </div>
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
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>6 semantic color variants · bg=true</p>

      <Section title="With icon · bg filled">
        {VARIANTS.map(variant => (
          <Tile key={variant} label={variant}>
            <IconWithRing variant={variant} icon={VARIANT_ICONS[variant]} bg size={120} />
          </Tile>
        ))}
      </Section>

      <Section title="With icon · bg white">
        {VARIANTS.map(variant => (
          <Tile key={variant} label={variant}>
            <IconWithRing variant={variant} icon={VARIANT_ICONS[variant]} bg={false} size={120} />
          </Tile>
        ))}
      </Section>

      <Section title="Loading · bg filled">
        {VARIANTS.map(variant => (
          <Tile key={variant} label={variant}>
            <IconWithRing variant={variant} loading bg size={120} />
          </Tile>
        ))}
      </Section>
    </div>
  ),
};

export const WithIllustration: Story = {
  name: 'With Illustration',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>With Illustration</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>illustration prop — uses Illustration component in center</p>

      <Section title="bg filled">
        <Tile label="success · store"><IconWithRing variant="success" illustration="store" bg size={160} /></Tile>
        <Tile label="error · cloud-off"><IconWithRing variant="error" illustration="cloud-off" bg size={160} /></Tile>
        <Tile label="brand · cart"><IconWithRing variant="brand" illustration="cart" bg size={160} /></Tile>
        <Tile label="info · location"><IconWithRing variant="info" illustration="location" bg size={160} /></Tile>
        <Tile label="warning · server"><IconWithRing variant="warning" illustration="server" bg size={160} /></Tile>
        <Tile label="gray · docs-boq"><IconWithRing variant="gray" illustration="docs-boq" bg size={160} /></Tile>
      </Section>

      <Section title="bg white">
        <Tile label="success · store"><IconWithRing variant="success" illustration="store" bg={false} size={160} /></Tile>
        <Tile label="error · cloud-off"><IconWithRing variant="error" illustration="cloud-off" bg={false} size={160} /></Tile>
        <Tile label="brand · cart"><IconWithRing variant="brand" illustration="cart" bg={false} size={160} /></Tile>
      </Section>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sizes</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>size prop — raw px value</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-end' }}>
        {([80, 100, 120, 160, 200, 240] as const).map(size => (
          <Tile key={size} label={`${size}px`}>
            <IconWithRing variant="brand" icon={<StarIcon />} size={size} />
          </Tile>
        ))}
      </div>
    </div>
  ),
};

export const BgToggle: Story = {
  name: 'Center Fill (bg)',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Center Fill</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>bg=true (subtle tint) vs bg=false (white)</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'flex-end' }}>
        {VARIANTS.map(variant => (
          <div key={variant} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <Tile label="bg=true">
                <IconWithRing variant={variant} icon={VARIANT_ICONS[variant]} bg size={100} />
              </Tile>
              <Tile label="bg=false">
                <IconWithRing variant={variant} icon={VARIANT_ICONS[variant]} bg={false} size={100} />
              </Tile>
            </div>
            <Label>{variant}</Label>
          </div>
        ))}
      </div>
    </div>
  ),
};
