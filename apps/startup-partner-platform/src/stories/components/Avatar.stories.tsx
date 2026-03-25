import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarLabelGroup } from '@/design-system';
import type {
  AvatarProps,
  AvatarSize,
  AvatarCorner,
  AvatarIndicator,
  AvatarContextType,
  AvatarLabelGroupSize,
} from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<AvatarProps> = {
  title: 'Design System/Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Avatar** — Allkons Design System

Sources:
- [Figma: Avatar](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=250-32148)
- [Figma: AvatarLabelGroup](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001625-30803)

\`\`\`tsx
<Avatar />
<Avatar size="lg" initials="JD" />
<Avatar size="md" src="/avatar.jpg" indicator="online" />
<Avatar size="xl" initials="AB" corner="rounded" indicator="verified" />
<AvatarLabelGroup name="Jane Doe" supporting="jane@example.com" />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    size:        { control: 'radio',   options: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[] },
    corner:      { control: 'radio',   options: ['full', 'rounded', 'none'] as AvatarCorner[] },
    indicator:   { control: 'select',  options: ['none', 'online', 'offline', 'company', 'verified', 'edit', 'notification', 'context'] as AvatarIndicator[] },
    contextType: { control: 'radio',   options: ['personal', 'juristic-personal', 'juristic'] as AvatarContextType[] },
    online:      { control: 'boolean' },
    src:         { control: 'text' },
    initials:    { control: 'text' },
    icon:        { control: false },
    className:   { control: false },
  },
  args: {
    size:        'md',
    corner:      'full',
    indicator:   'none',
    online:      true,
    contextType: 'personal',
  },
};

export default meta;
type Story = StoryObj<AvatarProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIZES: AvatarSize[]    = ['xs', 'sm', 'md', 'lg', 'xl'];
const CORNERS: AvatarCorner[] = ['full', 'rounded', 'none'];
const INDICATORS: AvatarIndicator[] = [
  'none', 'online', 'offline', 'company', 'verified', 'edit', 'notification', 'context',
];
const CONTEXT_TYPES: AvatarContextType[] = ['personal', 'juristic-personal', 'juristic'];

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
      {title}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
      {children}
    </div>
  </div>
);

const Cell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <div>{children}</div>
    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9DA6B5' }}>{label}</span>
  </div>
);

// Sample avatar image URL (public placeholder — replace with project assets)
const SAMPLE_SRC = 'https://i.pravatar.cc/56?img=3';

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Avatar — Sizes</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>xs=24 · sm=32 · md=40 · lg=48 · xl=56 (px)</p>

      <Row title="Placeholder (no src)">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} />
          </Cell>
        ))}
      </Row>

      <Row title="Initials">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} initials="JD" />
          </Cell>
        ))}
      </Row>

      <Row title="Image">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} src={SAMPLE_SRC} alt="Sample avatar" />
          </Cell>
        ))}
      </Row>
    </div>
  ),
};

// ─── Corner Variants ──────────────────────────────────────────────────────────

export const CornerVariants: Story = {
  name: 'Corner Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Corner</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>full (circle) · rounded (12px) · none</p>

      {(['placeholder', 'initials', 'image'] as const).map(type => (
        <Row key={type} title={`content: ${type}`}>
          {CORNERS.map(corner => (
            <Cell key={corner} label={`corner="${corner}"`}>
              <Avatar
                size="lg"
                corner={corner}
                {...(type === 'initials' ? { initials: 'AB' } : {})}
                {...(type === 'image' ? { src: SAMPLE_SRC, alt: 'Sample' } : {})}
              />
            </Cell>
          ))}
        </Row>
      ))}
    </div>
  ),
};

// ─── Indicators ───────────────────────────────────────────────────────────────

export const Indicators: Story = {
  name: 'Indicators',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Badge Indicators</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>all indicator types at md size</p>

      <Row title="All indicator types — size md">
        {INDICATORS.filter(i => i !== 'none').map(indicator => (
          <Cell key={indicator} label={indicator}>
            <Avatar size="md" initials="JD" indicator={indicator} />
          </Cell>
        ))}
      </Row>

      <Row title="Context badge types">
        {CONTEXT_TYPES.map(ctx => (
          <Cell key={ctx} label={ctx}>
            <Avatar size="md" initials="JD" indicator="context" contextType={ctx} />
          </Cell>
        ))}
      </Row>

      <Row title="Indicators across sizes (online)">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} initials="JD" indicator="online" />
          </Cell>
        ))}
      </Row>

      <Row title="Indicators across sizes (verified)">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} initials="JD" indicator="verified" />
          </Cell>
        ))}
      </Row>

      <Row title="Indicators across sizes (notification)">
        {SIZES.map(size => (
          <Cell key={size} label={`size="${size}"`}>
            <Avatar size={size} initials="JD" indicator="notification" />
          </Cell>
        ))}
      </Row>
    </div>
  ),
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Avatar — All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        size × corner × content × indicator
      </p>

      {SIZES.map(size => (
        <div key={size} style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
            size="{size}"
          </h3>

          {/* Default type (placeholder) across corners */}
          <Row title="Placeholder · corner: full / rounded / none">
            {CORNERS.map(corner => (
              <Cell key={corner} label={corner}>
                <Avatar size={size} corner={corner} />
              </Cell>
            ))}
          </Row>

          {/* Initials across corners */}
          <Row title="Initials · corner: full / rounded / none">
            {CORNERS.map(corner => (
              <Cell key={corner} label={corner}>
                <Avatar size={size} corner={corner} initials="AB" />
              </Cell>
            ))}
          </Row>

          {/* Indicators on full corner */}
          <Row title="Indicators (corner: full)">
            {INDICATORS.filter(i => i !== 'none').map(indicator => (
              <Cell key={indicator} label={indicator}>
                <Avatar size={size} initials="JD" indicator={indicator} />
              </Cell>
            ))}
          </Row>
        </div>
      ))}
    </div>
  ),
};

// ─── AvatarLabelGroup ─────────────────────────────────────────────────────────

export const LabelGroup: Story = {
  name: 'AvatarLabelGroup',
  render: () => {
    const GROUP_SIZES: AvatarLabelGroupSize[] = ['xs', 'sm', 'md', 'lg'];

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>AvatarLabelGroup</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>
          Avatar + display name + supporting text — sizes xs/sm/md/lg
        </p>

        <Row title="sizes — placeholder avatar">
          {GROUP_SIZES.map(size => (
            <Cell key={size} label={`size="${size}"`}>
              <AvatarLabelGroup
                size={size}
                name="Jane Doe"
                supporting="jane@example.com"
              />
            </Cell>
          ))}
        </Row>

        <Row title="sizes — initials avatar">
          {GROUP_SIZES.map(size => (
            <Cell key={size} label={`size="${size}"`}>
              <AvatarLabelGroup
                size={size}
                avatarProps={{ initials: 'JD' }}
                name="Jane Doe"
                supporting="jane@example.com"
              />
            </Cell>
          ))}
        </Row>

        <Row title="sizes — image avatar with indicator">
          {GROUP_SIZES.map(size => (
            <Cell key={size} label={`size="${size}"`}>
              <AvatarLabelGroup
                size={size}
                avatarProps={{ src: SAMPLE_SRC, alt: 'Jane Doe', indicator: 'online' }}
                name="Jane Doe"
                supporting="jane@example.com"
              />
            </Cell>
          ))}
        </Row>

        <Row title="name only (no supporting text)">
          {GROUP_SIZES.map(size => (
            <Cell key={size} label={`size="${size}"`}>
              <AvatarLabelGroup
                size={size}
                avatarProps={{ initials: 'JD' }}
                name="Jane Doe"
              />
            </Cell>
          ))}
        </Row>
      </div>
    );
  },
};

// ─── Usage in Context ─────────────────────────────────────────────────────────

export const UsageInContext: Story = {
  name: 'Usage in Context',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Usage in Context</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>Chat list / user card examples</p>

      {/* Chat / user list */}
      <div style={{ maxWidth: 400, borderRadius: 12, border: '1px solid #DEE1E6', overflow: 'hidden', marginBottom: 32 }}>
        {[
          { initials: 'JD', name: 'Jane Doe',    sub: 'jane@example.com',    indicator: 'online'   as AvatarIndicator },
          { initials: 'MS', name: 'Mark Smith',  sub: 'mark@example.com',    indicator: 'offline'  as AvatarIndicator },
          { initials: 'AB', name: 'Alice Brown', sub: 'alice@example.com',   indicator: 'verified' as AvatarIndicator },
          { initials: 'TC', name: 'Tom Clark',   sub: 'tom@example.com',     indicator: 'company'  as AvatarIndicator },
        ].map(({ initials, name, sub, indicator }, i, arr) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid #DEE1E6' : 'none',
              background: 'white',
              gap: 12,
            }}
          >
            <Avatar initials={initials} indicator={indicator} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#12151A', margin: 0 }}>{name}</p>
              <p style={{ fontSize: 12, color: '#7C889C', margin: '2px 0 0' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Context badge types */}
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Context badge types</h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {CONTEXT_TYPES.map(ctx => (
          <div key={ctx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Avatar size="lg" initials="JD" indicator="context" contextType={ctx} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9DA6B5' }}>{ctx}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
