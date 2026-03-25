import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProgressSteps } from '@/design-system';
import type { ProgressStepsProps, StepSize, StepType, StepLayout, StepStatus } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<ProgressStepsProps> = {
  title: 'Design System/Components/ProgressSteps',
  component: ProgressSteps,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ProgressSteps** — Allkons Design System

Sources:
- [Figma: StepIcon](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008812-7637)
- [Figma: NavStep item](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008853-6712)
- [Figma: Steps item](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008853-6743)
- [Figma: ProgressSteps](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008856-12016)

\`\`\`tsx
// Vertical wizard (default)
<ProgressSteps steps={steps} current={1} />

// Horizontal navigation bar
<ProgressSteps steps={steps} current={0} layout="horizontal" />

// Number type
<ProgressSteps steps={steps} current={2} type="number" size="lg" />

// With error state override
<ProgressSteps
  steps={[
    { title: 'Verified', status: 'finished' },
    { title: 'Failed', status: 'error', description: 'Payment declined' },
    { title: 'Shipping' },
  ]}
  current={1}
/>
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    size:            { control: 'radio',  options: ['sm', 'md', 'lg'] as StepSize[] },
    type:            { control: 'radio',  options: ['default', 'number', 'icon'] as StepType[] },
    layout:          { control: 'radio',  options: ['horizontal', 'vertical'] as StepLayout[] },
    current:         { control: { type: 'range', min: 0, max: 4, step: 1 } },
    showDescription: { control: 'boolean' },
    steps:           { control: false },
  },
  args: {
    current:         1,
    size:            'md',
    type:            'default',
    layout:          'vertical',
    showDescription: true,
  },
};

export default meta;
type Story = StoryObj<ProgressStepsProps>;

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_STEPS = [
  { title: 'Order placed',   description: 'We received your order.' },
  { title: 'Processing',     description: 'Preparing your items.' },
  { title: 'Shipped',        description: 'On the way to you.' },
  { title: 'Delivered',      description: 'Package delivered.' },
];

// Inline SVG icon for type='icon' stories
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const ICON_STEPS = SAMPLE_STEPS.map(s => ({ ...s, icon: <TruckIcon /> }));

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <ProgressSteps {...args} steps={SAMPLE_STEPS} />
    </div>
  ),
};

// ─── Layouts ──────────────────────────────────────────────────────────────────

export const Layouts: Story = {
  name: 'Layouts',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>ProgressSteps — Layouts</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        horizontal = compact nav bar · vertical = wizard step indicator
      </p>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          layout="horizontal" (navigation bar)
        </p>
        <ProgressSteps steps={SAMPLE_STEPS} current={1} layout="horizontal" />
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          layout="vertical" (wizard)
        </p>
        <ProgressSteps steps={SAMPLE_STEPS} current={1} layout="vertical" />
      </div>
    </div>
  ),
};

// ─── Step Statuses ────────────────────────────────────────────────────────────

export const StepStatuses: Story = {
  name: 'Step Statuses',
  render: () => {
    const STATUSES: StepStatus[] = ['finished', 'current', 'in-progress', 'waiting', 'error'];

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Step Statuses</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>
          Each status individually — type × status
        </p>

        {(['default', 'number', 'icon'] as StepType[]).map(type => (
          <div key={type} style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
              type="{type}"
            </p>
            <ProgressSteps
              steps={STATUSES.map(s => ({
                title: s,
                description: `${s} description`,
                status: s,
                icon: type === 'icon' ? <TruckIcon /> : undefined,
              }))}
              current={0}
              type={type}
              layout="vertical"
              size="md"
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sizes</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        sm (24px) · md (32px) · lg (64px)
      </p>

      {(['sm', 'md', 'lg'] as StepSize[]).map(size => (
        <div key={size} style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            size="{size}"
          </p>
          <ProgressSteps steps={SAMPLE_STEPS} current={1} size={size} layout="vertical" />
        </div>
      ))}
    </div>
  ),
};

// ─── Icon Types ───────────────────────────────────────────────────────────────

export const IconTypes: Story = {
  name: 'Icon Types',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Icon Types</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        default (dot/check/×) · number · icon (custom ReactNode)
      </p>

      {(['default', 'number', 'icon'] as StepType[]).map(type => (
        <div key={type} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            type="{type}"
          </p>
          <ProgressSteps
            steps={type === 'icon' ? ICON_STEPS : SAMPLE_STEPS}
            current={1}
            type={type}
            layout="vertical"
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Interactive ──────────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    const [current, setCurrent] = useState(0);
    const total = SAMPLE_STEPS.length;

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Interactive</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>Click Next / Back to advance the stepper</p>

        <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Horizontal nav */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Horizontal
            </p>
            <ProgressSteps steps={SAMPLE_STEPS} current={current} layout="horizontal" type="number" />
          </div>

          {/* Vertical wizard */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Vertical
            </p>
            <ProgressSteps steps={SAMPLE_STEPS} current={current} layout="vertical" type="number" size="lg" />
          </div>

          {/* Step content placeholder */}
          <div style={{ padding: 24, borderRadius: 12, border: '1px solid #DEE1E6', background: '#F7F8F9', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#12151A' }}>
              {SAMPLE_STEPS[Math.min(current, total - 1)].title}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              style={{
                padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: 'transparent', color: current === 0 ? '#BDC3CD' : '#495569',
                border: `1px solid ${current === 0 ? '#EFF0F3' : '#DEE1E6'}`,
                cursor: current === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
              disabled={current === total - 1}
              style={{
                padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: current === total - 1 ? '#EFF0F3' : '#00AF43',
                color: current === total - 1 ? '#BDC3CD' : 'white',
                border: 'none',
                cursor: current === total - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  },
};

// ─── Error State ──────────────────────────────────────────────────────────────

export const ErrorState: Story = {
  name: 'Error State',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Error State</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        Per-step status override — use status="error" on any step
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Vertical
          </p>
          <ProgressSteps
            steps={[
              { title: 'Order placed',  description: 'Order confirmed.', status: 'finished' },
              { title: 'Payment',       description: 'Payment declined.',  status: 'error' },
              { title: 'Shipped',       description: 'Waiting for payment.' },
              { title: 'Delivered',     description: 'Package delivered.' },
            ]}
            current={1}
            layout="vertical"
            type="number"
          />
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Horizontal
          </p>
          <ProgressSteps
            steps={[
              { title: 'Order placed', status: 'finished' },
              { title: 'Payment',      status: 'error',    description: 'Payment declined.' },
              { title: 'Shipped' },
              { title: 'Delivered' },
            ]}
            current={1}
            layout="horizontal"
            type="default"
          />
        </div>
      </div>
    </div>
  ),
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        layout × type × size
      </p>

      {(['horizontal', 'vertical'] as StepLayout[]).map(layout => (
        <div key={layout} style={{ marginBottom: 64 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 24 }}>layout="{layout}"</h3>

          {(['default', 'number', 'icon'] as StepType[]).map(type => (
            <div key={type} style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#495569', marginBottom: 12 }}>
                type="{type}"
              </p>
              {(layout === 'vertical' ? ['sm', 'md', 'lg'] : ['sm', 'md'] as StepSize[]).map(size => (
                <div key={size} style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9DA6B5', marginBottom: 8 }}>
                    size="{size}"
                  </p>
                  <ProgressSteps
                    steps={type === 'icon' ? ICON_STEPS : SAMPLE_STEPS}
                    current={1}
                    layout={layout}
                    type={type}
                    size={size as StepSize}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
