import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Radio, RadioGroup } from '@/design-system';
import type { RadioProps, RadioSize } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<RadioProps> = {
  title: 'Design System/Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Radio / RadioGroup** — Allkons Design System

Sources:
- [Figma: RadioBase](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001601-28536)
- [Figma: Radio](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001601-29380)

\`\`\`tsx
// Single radio
<Radio label="Option A" value="a" checked={val === 'a'} onChange={setVal} />

// RadioGroup (recommended for mutual-exclusion)
<RadioGroup
  name="plan"
  value={plan}
  onChange={setPlan}
  options={[
    { value: 'starter', label: 'Starter', supportingText: 'For individuals' },
    { value: 'pro',     label: 'Pro',     supportingText: 'For teams' },
  ]}
/>
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    size:    { control: 'radio', options: ['sm', 'md', 'lg'] as RadioSize[] },
    checked: { control: 'boolean' },
    disabled:{ control: 'boolean' },
    label:   { control: 'text' },
    supportingText: { control: 'text' },
  },
  args: {
    size:     'md',
    checked:  false,
    disabled: false,
    label:    'Option label',
    supportingText: '',
    value:    'option',
  },
};

export default meta;
type Story = StoryObj<RadioProps>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
      <Radio
        {...args}
        checked={checked}
        onChange={() => setChecked(c => !c)}
      />
    );
  },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  name: 'States',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>States</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        Unchecked · Checked — across sizes and disabled state
      </p>

      {[
        { label: 'Unchecked',         checked: false, disabled: false },
        { label: 'Checked',           checked: true,  disabled: false },
        { label: 'Disabled',          checked: false, disabled: true  },
        { label: 'Disabled checked',  checked: true,  disabled: true  },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 180, fontSize: 12, color: '#7C889C' }}>{s.label}</div>
          {(['sm', 'md', 'lg'] as RadioSize[]).map(size => (
            <Radio
              key={size}
              size={size}
              checked={s.checked}
              disabled={s.disabled}
              name={`state-${s.label}`}
              onChange={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ─── With Labels ──────────────────────────────────────────────────────────────

export const WithLabels: Story = {
  name: 'With Labels',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>With Labels</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>label only · label + supporting text</p>

      {(['sm', 'md', 'lg'] as RadioSize[]).map(size => (
        <div key={size} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            size="{size}"
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
            <Radio size={size} label="Option A" name={`labels-${size}`} value="a" />
            <Radio size={size} label="Option B" name={`labels-${size}`} value="b" defaultChecked />
            <Radio size={size} label="With supporting text" supportingText="Additional details about this option." name={`labels-${size}`} value="c" />
            <Radio size={size} label="Disabled option" disabled name={`labels-${size}`} value="d" />
            <Radio size={size} label="Disabled selected" supportingText="This selection is locked." disabled defaultChecked name={`labels-${size}`} value="e" />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── RadioGroup: Vertical ────────────────────────────────────────────────────

export const GroupVertical: Story = {
  name: 'RadioGroup — Vertical',
  render: () => {
    const [plan, setPlan] = useState('starter');

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>RadioGroup — Vertical</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>
          Mutual exclusion · controlled · supporting text per option
        </p>

        <div style={{ maxWidth: 420 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            Choose your plan
          </p>
          <RadioGroup
            name="plan"
            value={plan}
            onChange={setPlan}
            size="md"
            options={[
              { value: 'starter', label: 'Starter',   supportingText: 'For individuals and small projects. Free forever.' },
              { value: 'pro',     label: 'Pro',        supportingText: 'For growing teams. $12 / seat / month.' },
              { value: 'business',label: 'Business',   supportingText: 'Advanced security and compliance. $24 / seat / month.' },
              { value: 'enterprise', label: 'Enterprise', supportingText: 'Custom pricing. Contact sales.', disabled: true },
            ]}
          />
          <p style={{ marginTop: 24, fontSize: 14, color: '#495569' }}>
            Selected: <strong>{plan}</strong>
          </p>
        </div>
      </div>
    );
  },
};

// ─── RadioGroup: Horizontal ───────────────────────────────────────────────────

export const GroupHorizontal: Story = {
  name: 'RadioGroup — Horizontal',
  render: () => {
    const [gender, setGender] = useState('');
    const [size, setSize] = useState('md');

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>RadioGroup — Horizontal</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>Inline layout for short options</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 600 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 12 }}>Gender</p>
            <RadioGroup
              name="gender"
              value={gender}
              onChange={setGender}
              direction="horizontal"
              options={[
                { value: 'male',   label: 'Male'   },
                { value: 'female', label: 'Female' },
                { value: 'other',  label: 'Other'  },
              ]}
            />
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 12 }}>T-Shirt size</p>
            <RadioGroup
              name="size"
              value={size}
              onChange={setSize}
              direction="horizontal"
              size="sm"
              options={[
                { value: 'xs', label: 'XS' },
                { value: 'sm', label: 'S'  },
                { value: 'md', label: 'M'  },
                { value: 'lg', label: 'L'  },
                { value: 'xl', label: 'XL' },
              ]}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ─── RadioGroup: Sizes ────────────────────────────────────────────────────────

export const GroupSizes: Story = {
  name: 'RadioGroup — Sizes',
  render: () => {
    const [vals, setVals] = useState<Record<string, string>>({ sm: 'a', md: 'b', lg: '' });

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sizes</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>sm · md · lg across a full group</p>

        {(['sm', 'md', 'lg'] as RadioSize[]).map(size => (
          <div key={size} style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
              size="{size}"
            </p>
            <RadioGroup
              name={`sizes-${size}`}
              value={vals[size]}
              onChange={v => setVals(prev => ({ ...prev, [size]: v }))}
              size={size}
              options={[
                { value: 'a', label: 'Option A', supportingText: 'First choice.' },
                { value: 'b', label: 'Option B', supportingText: 'Second choice.' },
                { value: 'c', label: 'Option C (disabled)', supportingText: 'Not available.', disabled: true },
              ]}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Usage in Context ─────────────────────────────────────────────────────────

export const UsageInContext: Story = {
  name: 'Usage in Context',
  render: () => {
    const [billing, setBilling] = useState('monthly');
    const [notify, setNotify] = useState('email');

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Usage in Context</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>Real-world form examples</p>

        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {/* Billing cycle */}
          <div style={{ minWidth: 280 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#12151A', marginBottom: 4 }}>
              Billing cycle
            </p>
            <p style={{ fontSize: 14, color: '#7C889C', marginBottom: 20 }}>
              How often would you like to be billed?
            </p>
            <RadioGroup
              name="billing"
              value={billing}
              onChange={setBilling}
              options={[
                { value: 'monthly',  label: 'Monthly',  supportingText: '$12 per seat / month.' },
                { value: 'yearly',   label: 'Yearly',   supportingText: '$120 per seat / year — save 17%.' },
              ]}
            />
          </div>

          {/* Notification preference */}
          <div style={{ minWidth: 280 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#12151A', marginBottom: 4 }}>
              Notification method
            </p>
            <p style={{ fontSize: 14, color: '#7C889C', marginBottom: 20 }}>
              How should we notify you?
            </p>
            <RadioGroup
              name="notify"
              value={notify}
              onChange={setNotify}
              options={[
                { value: 'email', label: 'Email',        supportingText: 'Receive updates at your registered email.' },
                { value: 'sms',   label: 'SMS',          supportingText: 'Text alerts to your phone number.' },
                { value: 'push',  label: 'Push notification', supportingText: 'In-app and mobile push alerts.' },
                { value: 'none',  label: 'None',         supportingText: 'I will check the dashboard manually.' },
              ]}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>size × checked × disabled</p>

      {(['sm', 'md', 'lg'] as RadioSize[]).map(size => (
        <div key={size} style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 20 }}>
            size="{size}"
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 600 }}>
            <Radio size={size} label="Unchecked" supportingText="Default state." name={`all-${size}`} value="a" />
            <Radio size={size} label="Checked" supportingText="Selected state." name={`all-${size}`} value="b" defaultChecked />
            <Radio size={size} label="Disabled" supportingText="Locked state." name={`all-${size}-d`} value="c" disabled />
            <Radio size={size} label="Disabled checked" supportingText="Locked selected." name={`all-${size}-d`} value="d" disabled defaultChecked />
          </div>
        </div>
      ))}
    </div>
  ),
};
