import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProgressBar } from '@/design-system';
import type { ProgressBarProps, ProgressLabelPosition } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<ProgressBarProps> = {
  title: 'Design System/Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ProgressBar** — Allkons Design System

Source: [Figma DS1 → ProgressBar](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40007892-6022)

\`\`\`tsx
<ProgressBar value={60} />
<ProgressBar value={60} label="right" />
<ProgressBar value={60} label="bottom" />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '0–100',
    },
    label: {
      control: 'radio',
      options: ['none', 'right', 'bottom'] as ProgressLabelPosition[],
    },
  },
  args: {
    value: 60,
    label: 'none',
  },
};

export default meta;
type Story = StoryObj<ProgressBarProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const LABEL_POSITIONS: ProgressLabelPosition[] = ['none', 'right', 'bottom'];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
      {title}
    </p>
    {children}
  </div>
);

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
};

// ─── Label Positions ──────────────────────────────────────────────────────────

export const LabelPositions: Story = {
  name: 'Label Positions',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>ProgressBar — Label Positions</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        none · right · bottom
      </p>

      <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {LABEL_POSITIONS.map(label => (
          <Section key={label} title={`label="${label}"`}>
            <ProgressBar value={60} label={label} />
          </Section>
        ))}
      </div>
    </div>
  ),
};

// ─── All Values ───────────────────────────────────────────────────────────────

export const AllValues: Story = {
  name: 'All Values',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Values</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>0% → 100% in 10% steps</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
        {LABEL_POSITIONS.map(label => (
          <div key={label}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20 }}>
              label="{label}"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {STEPS.map(step => (
                <ProgressBar key={step} value={step} label={label} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ─── Animated ─────────────────────────────────────────────────────────────────

export const Animated: Story = {
  name: 'Animated',
  render: () => {
    const [progress, setProgress] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      if (!running) return;
      if (progress >= 100) {
        setRunning(false);
        return;
      }
      const id = setTimeout(() => setProgress(p => Math.min(100, p + 2)), 60);
      return () => clearTimeout(id);
    }, [running, progress]);

    const reset = () => { setProgress(0); setRunning(false); };
    const start = () => { if (progress >= 100) setProgress(0); setRunning(true); };

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Animated</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>CSS transition on width — 300ms ease-in-out</p>

        <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ProgressBar value={progress} label="right" />
          <ProgressBar value={progress} label="bottom" />
          <ProgressBar value={progress} />

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={start}
              disabled={running}
              style={{
                padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: running ? 'not-allowed' : 'pointer',
                background: running ? '#EFF0F3' : '#00AF43', color: running ? '#BDC3CD' : 'white',
                border: 'none',
              }}
            >
              {running ? 'Running…' : progress >= 100 ? 'Restart' : 'Start'}
            </button>
            <button
              onClick={reset}
              style={{
                padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                background: 'transparent', color: '#495569', border: '1px solid #DEE1E6',
              }}
            >
              Reset
            </button>
          </div>
        </div>
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
      <p style={{ color: '#7C889C', marginBottom: 32 }}>File upload / task list examples</p>

      {/* Upload list */}
      <div style={{ maxWidth: 400, borderRadius: 12, border: '1px solid #DEE1E6', overflow: 'hidden' }}>
        {[
          { name: 'document.pdf',   size: '2.4 MB',  progress: 100 },
          { name: 'image.png',      size: '1.1 MB',  progress: 72  },
          { name: 'report.xlsx',    size: '890 KB',  progress: 35  },
          { name: 'backup.zip',     size: '14.2 MB', progress: 8   },
        ].map(({ name, size, progress }, i, arr) => (
          <div
            key={name}
            style={{
              padding: '16px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid #DEE1E6' : 'none',
              background: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#12151A' }}>{name}</span>
              <span style={{ fontSize: 12, color: '#7C889C' }}>{size}</span>
            </div>
            <ProgressBar value={progress} label="right" />
          </div>
        ))}
      </div>
    </div>
  ),
};
