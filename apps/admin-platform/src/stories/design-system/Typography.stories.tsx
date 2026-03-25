import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { textStyles, fontFamily, fontWeight } from '@/design-system';

const TypographySample = ({
  name,
  style,
}: {
  name: string;
  style: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing?: string };
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '12px 0', borderBottom: '1px solid #EFF0F3' }}>
    <div style={{ width: 200, flexShrink: 0 }}>
      <div style={{ fontSize: 12, color: '#7C889C', fontFamily: 'monospace' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#BDC3CD', fontFamily: 'monospace', marginTop: 2 }}>
        {style.fontSize}px / {style.lineHeight}px / w{style.fontWeight}
      </div>
    </div>
    <div
      style={{
        fontFamily: fontFamily.primary,
        fontSize: style.fontSize,
        lineHeight: `${style.lineHeight}px`,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        color: '#12151A',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        maxWidth: 500,
      }}
    >
      สวัสดีชาวโลก — Hello World
    </div>
  </div>
);

const TypographyDoc = () => (
  <div style={{ padding: 24, fontFamily: '"Noto Sans Thai Looped", sans-serif', maxWidth: 800 }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Typography</h1>
    <p style={{ color: '#7C889C', marginBottom: 8 }}>Figma: Allkons DS1 — Typography page</p>
    <p style={{ color: '#9DA6B5', fontSize: 14, marginBottom: 40 }}>
      Primary font: <strong>Noto Sans Thai Looped</strong> · Secondary: <strong>Kanit</strong>
    </p>

    {Object.entries(textStyles).map(([name, style]) => (
      <TypographySample key={name} name={name} style={style} />
    ))}
  </div>
);

const meta: Meta = {
  title: 'Design System/Tokens/Typography',
  component: TypographyDoc,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const AllTextStyles: StoryObj = { render: () => <TypographyDoc /> };

export const Headings: StoryObj = {
  render: () => (
    <div style={{ padding: 24, fontFamily: '"Noto Sans Thai Looped", sans-serif' }}>
      {(['display-d1','display-d2','display-d3','heading-h1','heading-h2','heading-h3','heading-h4','heading-h5','heading-h6'] as const).map((key) => {
        const s = textStyles[key];
        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#9DA6B5', fontFamily: 'monospace', marginBottom: 4 }}>{key}</div>
            <div style={{ fontSize: s.fontSize, lineHeight: `${s.lineHeight}px`, fontWeight: s.fontWeight }}>
              สวัสดีชาวโลก — Hello World
            </div>
          </div>
        );
      })}
    </div>
  ),
};

export const BodyText: StoryObj = {
  render: () => (
    <div style={{ padding: 24, fontFamily: '"Noto Sans Thai Looped", sans-serif', maxWidth: 600 }}>
      {(['big-regular','big-medium','big-semibold','middle-regular','middle-medium','middle-semibold','small-regular','small-medium','small-semibold','xs-regular','xs-medium','xs-semibold'] as const).map((key) => {
        const s = textStyles[key];
        return (
          <div key={key} style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <span style={{ width: 160, fontSize: 11, color: '#9DA6B5', fontFamily: 'monospace', flexShrink: 0 }}>{key}</span>
            <span style={{ fontSize: s.fontSize, lineHeight: `${s.lineHeight}px`, fontWeight: s.fontWeight }}>
              สวัสดีชาวโลก — Hello World
            </span>
          </div>
        );
      })}
    </div>
  ),
};
