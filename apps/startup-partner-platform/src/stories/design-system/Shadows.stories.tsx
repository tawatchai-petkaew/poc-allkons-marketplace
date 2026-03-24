import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { shadows, focusRings } from '@/design-system';

const ShadowCard = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div
      style={{
        width: 120,
        height: 80,
        borderRadius: 12,
        background: '#FFFFFF',
        boxShadow: value,
        border: '1px solid #F7F8F9',
      }}
    />
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#12151A' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#9DA6B5', fontFamily: 'monospace', marginTop: 2, maxWidth: 180, wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  </div>
);

const FocusRingCard = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #EFF0F3' }}>
    <div
      style={{
        width: 80,
        height: 36,
        borderRadius: 8,
        background: '#FFFFFF',
        border: '1.5px solid #DEE1E6',
        boxShadow: value,
        flexShrink: 0,
      }}
    />
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#12151A' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#9DA6B5', fontFamily: 'monospace', marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

const ShadowsDoc = () => (
  <div style={{ padding: 32, fontFamily: '"Noto Sans Thai Looped", sans-serif', background: '#F7F8F9', minHeight: '100vh' }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Shadows & Effects</h1>
    <p style={{ color: '#7C889C', marginBottom: 40 }}>Figma: Allkons DS1 — Shadow page</p>

    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Drop Shadows</h2>
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 56 }}>
      {Object.entries(shadows)
        .filter(([, v]) => v !== 'none')
        .map(([name, value]) => (
          <ShadowCard key={name} name={`shadow-${name}`} value={value} />
        ))}
    </div>

    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Focus Rings</h2>
    <div style={{ maxWidth: 600 }}>
      {Object.entries(focusRings).map(([name, value]) => (
        <FocusRingCard key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

const meta: Meta = {
  title: 'Design System/Tokens/Shadows',
  component: ShadowsDoc,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'secondary' } },
};
export default meta;

export const AllShadows: StoryObj = { render: () => <ShadowsDoc /> };
