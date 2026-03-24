import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  brandPrimary, brandSecondary, brandTertiary,
  cmPrimary, cmSecondary, cmTertiary,
  success, warning, error, info,
  neutral, textColor, backgroundColor, borderColor,
} from '@/design-system';

const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        background: value,
        border: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}
    />
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#12151A' }}>{name}</div>
      <div style={{ fontSize: 12, color: '#7C889C', fontFamily: 'monospace' }}>{value}</div>
    </div>
  </div>
);

const ColorGroup = ({ title, group }: { title: string; group: Record<string, string> }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {title}
    </h3>
    {Object.entries(group).map(([key, value]) =>
      typeof value === 'string' ? (
        <ColorSwatch key={key} name={`${title}.${key}`} value={value} />
      ) : null
    )}
  </div>
);

const ColorsDoc = () => (
  <div style={{ padding: 24, fontFamily: '"Noto Sans Thai Looped", sans-serif', maxWidth: 600 }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Color System</h1>
    <p style={{ color: '#7C889C', marginBottom: 40 }}>Figma: Allkons DS1 — alias.ts (Layer 2 semantic tokens)</p>

    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Brand — M Platform</h2>
    <ColorGroup title="brandPrimary" group={brandPrimary as unknown as Record<string, string>} />
    <ColorGroup title="brandSecondary" group={brandSecondary as unknown as Record<string, string>} />
    <ColorGroup title="brandTertiary" group={brandTertiary as unknown as Record<string, string>} />

    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 8 }}>Brand — CM Platform</h2>
    <ColorGroup title="cmPrimary" group={cmPrimary as unknown as Record<string, string>} />
    <ColorGroup title="cmSecondary" group={cmSecondary as unknown as Record<string, string>} />
    <ColorGroup title="cmTertiary" group={cmTertiary as unknown as Record<string, string>} />

    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 8 }}>System</h2>
    <ColorGroup title="success" group={success as unknown as Record<string, string>} />
    <ColorGroup title="warning" group={warning as unknown as Record<string, string>} />
    <ColorGroup title="error"   group={error   as unknown as Record<string, string>} />
    <ColorGroup title="info"    group={info     as unknown as Record<string, string>} />

    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 8 }}>Global</h2>
    <ColorGroup title="neutral"    group={neutral    as unknown as Record<string, string>} />
    <ColorGroup title="textColor"  group={textColor  as unknown as Record<string, string>} />
    <ColorGroup title="background" group={backgroundColor as unknown as Record<string, string>} />
    <ColorGroup title="border"     group={borderColor as unknown as Record<string, string>} />
  </div>
);

const meta: Meta = {
  title: 'Design System/Tokens/Colors',
  component: ColorsDoc,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const AllColors: StoryObj = { render: () => <ColorsDoc /> };
