import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toggle } from '@/design-system';
import type { ToggleProps, ToggleColor, ToggleSize } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<ToggleProps> = {
  title: 'Design System/Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Toggle** — Allkons Design System

Source: [Figma DS1 → Toggle](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001595-9969)

\`\`\`tsx
<Toggle />
<Toggle color="success" showLabel />
<Toggle checked onChange={setChecked} />
<Toggle disabled />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    color:        { control: 'radio',   options: ['brand', 'success'] as ToggleColor[] },
    size:         { control: 'radio',   options: ['md', 'sm'] as ToggleSize[] },
    checked:      { control: 'boolean' },
    showLabel:    { control: 'boolean' },
    disabled:     { control: 'boolean' },
    onChange:     { control: false },
    defaultChecked: { control: false },
  },
  args: {
    color:     'brand',
    size:      'md',
    showLabel: false,
    disabled:  false,
  },
};

export default meta;
type Story = StoryObj<ToggleProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS:  ToggleColor[] = ['brand', 'success'];
const SIZES:   ToggleSize[]  = ['md', 'sm'];

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
      {title}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
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

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Toggle
        {...args}
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Toggle — All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        size × color × state × type — hover to see hover state
      </p>

      {SIZES.map(size => (
        <div key={size} style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
            size="{size}" ({size === 'md' ? '44×24px' : '36×20px'})
          </h3>

          {COLORS.map(color => (
            <div key={color} style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#495569', marginBottom: 16 }}>
                color="{color}"
              </p>

              {/* Default type */}
              <Row title="Type: Default">
                <Cell label="OFF · default">
                  <Toggle size={size} color={color} checked={false} />
                </Cell>
                <Cell label="ON · default">
                  <Toggle size={size} color={color} checked />
                </Cell>
                <Cell label="OFF · disabled">
                  <Toggle size={size} color={color} checked={false} disabled />
                </Cell>
                <Cell label="ON · disabled">
                  <Toggle size={size} color={color} checked disabled />
                </Cell>
              </Row>

              {/* Label type */}
              <Row title="Type: Label (ON/OFF text)">
                <Cell label="OFF · default">
                  <Toggle size={size} color={color} checked={false} showLabel />
                </Cell>
                <Cell label="ON · default">
                  <Toggle size={size} color={color} checked showLabel />
                </Cell>
                <Cell label="OFF · disabled">
                  <Toggle size={size} color={color} checked={false} showLabel disabled />
                </Cell>
                <Cell label="ON · disabled">
                  <Toggle size={size} color={color} checked showLabel disabled />
                </Cell>
              </Row>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

// ─── Interactive ──────────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    const [states, setStates] = useState({
      defaultBrand:   false,
      defaultSuccess: false,
      labelBrand:     false,
      labelSuccess:   false,
      smBrand:        false,
      smSuccess:      false,
    });

    const toggle = (key: keyof typeof states) =>
      setStates(s => ({ ...s, [key]: !s[key] }));

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Interactive</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>Click to toggle</p>

        <Row title="md · Default type">
          <Cell label={`brand · ${states.defaultBrand ? 'ON' : 'OFF'}`}>
            <Toggle color="brand" checked={states.defaultBrand} onChange={() => toggle('defaultBrand')} />
          </Cell>
          <Cell label={`success · ${states.defaultSuccess ? 'ON' : 'OFF'}`}>
            <Toggle color="success" checked={states.defaultSuccess} onChange={() => toggle('defaultSuccess')} />
          </Cell>
        </Row>

        <Row title="md · Label type">
          <Cell label={`brand · ${states.labelBrand ? 'ON' : 'OFF'}`}>
            <Toggle color="brand" showLabel checked={states.labelBrand} onChange={() => toggle('labelBrand')} />
          </Cell>
          <Cell label={`success · ${states.labelSuccess ? 'ON' : 'OFF'}`}>
            <Toggle color="success" showLabel checked={states.labelSuccess} onChange={() => toggle('labelSuccess')} />
          </Cell>
        </Row>

        <Row title="sm · Default type">
          <Cell label={`brand · ${states.smBrand ? 'ON' : 'OFF'}`}>
            <Toggle size="sm" color="brand" checked={states.smBrand} onChange={() => toggle('smBrand')} />
          </Cell>
          <Cell label={`success · ${states.smSuccess ? 'ON' : 'OFF'}`}>
            <Toggle size="sm" color="success" checked={states.smSuccess} onChange={() => toggle('smSuccess')} />
          </Cell>
        </Row>
      </div>
    );
  },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  name: 'States (all)',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>States</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>Default · Hover (hover in browser) · Focused (tab to focus) · Disabled</p>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 80px)', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #DEE1E6' }}>
        {['Variant', 'OFF', 'ON', 'Disabled OFF', 'Disabled ON'].map(h => (
          <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9DA6B5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
        ))}
      </div>

      {([
        { label: 'md · brand · default',   size: 'md' as const, color: 'brand' as const,   showLabel: false },
        { label: 'md · brand · label',     size: 'md' as const, color: 'brand' as const,   showLabel: true  },
        { label: 'md · success · default', size: 'md' as const, color: 'success' as const, showLabel: false },
        { label: 'md · success · label',   size: 'md' as const, color: 'success' as const, showLabel: true  },
        { label: 'sm · brand · default',   size: 'sm' as const, color: 'brand' as const,   showLabel: false },
        { label: 'sm · brand · label',     size: 'sm' as const, color: 'brand' as const,   showLabel: true  },
        { label: 'sm · success · default', size: 'sm' as const, color: 'success' as const, showLabel: false },
        { label: 'sm · success · label',   size: 'sm' as const, color: 'success' as const, showLabel: true  },
      ]).map(({ label, size, color, showLabel }) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 80px)', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#495569' }}>{label}</span>
          <Toggle size={size} color={color} showLabel={showLabel} checked={false} />
          <Toggle size={size} color={color} showLabel={showLabel} checked />
          <Toggle size={size} color={color} showLabel={showLabel} checked={false} disabled />
          <Toggle size={size} color={color} showLabel={showLabel} checked disabled />
        </div>
      ))}
    </div>
  ),
};

// ─── Usage in context ─────────────────────────────────────────────────────────

export const UsageInContext: Story = {
  name: 'Usage in Context',
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      emailUpdates:  false,
      darkMode:      false,
      autoSave:      true,
    });

    const toggle = (key: keyof typeof settings) =>
      setSettings(s => ({ ...s, [key]: !s[key] }));

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Usage in Context</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>Toggle as a settings list item</p>

        <div style={{ maxWidth: 400, borderRadius: 12, border: '1px solid #DEE1E6', overflow: 'hidden' }}>
          {[
            { key: 'notifications' as const, label: 'Push Notifications', desc: 'Receive alerts for new orders', color: 'brand' as const },
            { key: 'emailUpdates'  as const, label: 'Email Updates',       desc: 'Weekly digest and promotions',  color: 'brand' as const },
            { key: 'darkMode'      as const, label: 'Dark Mode',           desc: 'Use dark color scheme',         color: 'success' as const },
            { key: 'autoSave'      as const, label: 'Auto Save',           desc: 'Save drafts automatically',     color: 'success' as const },
          ].map(({ key, label, desc, color }, i, arr) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid #DEE1E6' : 'none',
                background: 'white',
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#12151A', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 12, color: '#7C889C', margin: '2px 0 0' }}>{desc}</p>
              </div>
              <Toggle
                color={color}
                checked={settings[key]}
                onChange={() => toggle(key)}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};
