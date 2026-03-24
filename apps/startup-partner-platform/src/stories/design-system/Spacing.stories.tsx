import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { spacing, borderRadius } from '@/design-system';

const SpacingRow = ({ unit, value }: { unit: string; value: string }) => {
  const px = parseInt(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #EFF0F3' }}>
      <div style={{ width: 60, fontSize: 12, fontFamily: 'monospace', color: '#7C889C' }}>space-{unit}</div>
      <div style={{ width: 48, fontSize: 12, fontFamily: 'monospace', color: '#9DA6B5' }}>{value}</div>
      <div style={{ background: '#00AF43', height: 20, width: px, borderRadius: 2, maxWidth: 400 }} />
    </div>
  );
};

const RadiusCard = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        width: 80,
        height: 60,
        background: '#E5F7EC',
        border: '2px solid #00AF43',
        borderRadius: value,
      }}
    />
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#12151A' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#9DA6B5', fontFamily: 'monospace' }}>{value}</div>
    </div>
  </div>
);

const SpacingDoc = () => (
  <div style={{ padding: 32, fontFamily: '"Noto Sans Thai Looped", sans-serif' }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Spacing & Border Radius</h1>
    <p style={{ color: '#7C889C', marginBottom: 40 }}>Figma: Allkons DS1 · Base unit: 4px</p>

    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Spacing Scale</h2>
    <div style={{ maxWidth: 600, marginBottom: 48 }}>
      {Object.entries(spacing).map(([unit, value]) => (
        <SpacingRow key={unit} unit={unit} value={value} />
      ))}
    </div>

    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Border Radius</h2>
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {Object.entries(borderRadius)
        .filter(([, v]) => v !== '9999px')
        .map(([name, value]) => (
          <RadiusCard key={name} name={`rounded-${name}`} value={value} />
        ))}
      <RadiusCard name="rounded-full" value="9999px" />
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/Tokens/Spacing & Radius',
  component: SpacingDoc,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const SpacingAndRadius: StoryObj = { render: () => <SpacingDoc /> };
