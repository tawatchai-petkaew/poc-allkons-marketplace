import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { colors } from '@/design-system';

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
        <ColorSwatch key={key} name={key === 'DEFAULT' ? title : `${title}.${key}`} value={value} />
      ) : null
    )}
  </div>
);

const ColorsDoc = () => (
  <div style={{ padding: 24, fontFamily: '"Noto Sans Thai Looped", sans-serif', maxWidth: 600 }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Color System</h1>
    <p style={{ color: '#7C889C', marginBottom: 40 }}>Figma: Allkons DS1 — Color system page</p>

    <ColorGroup title="primary" group={colors.primary as unknown as Record<string, string>} />
    <ColorGroup title="success" group={colors.success as unknown as Record<string, string>} />
    <ColorGroup title="warning" group={colors.warning as unknown as Record<string, string>} />
    <ColorGroup title="error"   group={colors.error as unknown as Record<string, string>} />
    <ColorGroup title="info"    group={colors.info as unknown as Record<string, string>} />
    <ColorGroup title="neutral" group={colors.neutral as unknown as Record<string, string>} />
    <ColorGroup title="text"    group={colors.text as unknown as Record<string, string>} />
    <ColorGroup title="background" group={colors.background as unknown as Record<string, string>} />
    <ColorGroup title="border"  group={colors.border as unknown as Record<string, string>} />
    <ColorGroup title="brand"   group={colors.brand as unknown as Record<string, string>} />
    <ColorGroup title="lavender" group={colors.lavender as unknown as Record<string, string>} />
    <ColorGroup title="darkOrange" group={colors.darkOrange as unknown as Record<string, string>} />
  </div>
);

const meta: Meta = {
  title: 'Design System/Tokens/Colors',
  component: ColorsDoc,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const AllColors: StoryObj = { render: () => <ColorsDoc /> };
