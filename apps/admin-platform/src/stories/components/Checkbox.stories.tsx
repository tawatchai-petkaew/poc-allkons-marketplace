import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Checkbox } from '@/design-system';
import type { CheckboxProps, CheckboxSize } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<CheckboxProps> = {
  title: 'Design System/Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Checkbox** — Allkons Design System

Sources:
- [Figma: CheckboxBase](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001601-28499)
- [Figma: Checkbox](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001601-28547)

\`\`\`tsx
// Uncontrolled
<Checkbox label="Remember me" defaultChecked />

// Controlled
<Checkbox
  label="Accept terms"
  supportingText="You agree to our Terms and Privacy Policy."
  checked={checked}
  onChange={setChecked}
/>

// Indeterminate
<Checkbox label="Select all" indeterminate />

// Disabled
<Checkbox label="Disabled option" disabled />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    size:          { control: 'radio', options: ['sm', 'md', 'lg'] as CheckboxSize[] },
    checked:       { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled:      { control: 'boolean' },
    label:         { control: 'text' },
    supportingText:{ control: 'text' },
  },
  args: {
    size:          'md',
    checked:       false,
    indeterminate: false,
    disabled:      false,
    label:         'Remember me',
    supportingText: '',
  },
};

export default meta;
type Story = StoryObj<CheckboxProps>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onChange={setChecked}
      />
    );
  },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  name: 'States',
  render: () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({
      default: false,
      hover: true,
      focused: false,
      disabled: false,
      disabledChecked: true,
    });

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>States</h2>
        <p style={{ color: '#7C889C', marginBottom: 40 }}>
          Unchecked · Checked · Indeterminate — across all states
        </p>

        {/* State grid */}
        {[
          { label: 'Default',           checked: false,  indeterminate: false, disabled: false },
          { label: 'Default checked',   checked: true,   indeterminate: false, disabled: false },
          { label: 'Indeterminate',     checked: false,  indeterminate: true,  disabled: false },
          { label: 'Disabled',          checked: false,  indeterminate: false, disabled: true  },
          { label: 'Disabled checked',  checked: true,   indeterminate: false, disabled: true  },
          { label: 'Disabled indet.',   checked: false,  indeterminate: true,  disabled: true  },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 180, fontSize: 12, color: '#7C889C' }}>{s.label}</div>
            {(['sm', 'md', 'lg'] as CheckboxSize[]).map(size => (
              <Checkbox
                key={size}
                size={size}
                checked={s.checked}
                indeterminate={s.indeterminate}
                disabled={s.disabled}
                onChange={() => {}}
              />
            ))}
          </div>
        ))}
      </div>
    );
  },
};

// ─── With Labels ──────────────────────────────────────────────────────────────

export const WithLabels: Story = {
  name: 'With Labels',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>With Labels</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        label only · label + supporting text — across sizes
      </p>

      {(['sm', 'md', 'lg'] as CheckboxSize[]).map(size => (
        <div key={size} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            size="{size}"
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
            <Checkbox size={size} label="Remember me" defaultChecked={false} />
            <Checkbox size={size} label="Accept terms" defaultChecked />
            <Checkbox
              size={size}
              label="Subscribe to newsletter"
              supportingText="You'll receive weekly product updates and news."
            />
            <Checkbox
              size={size}
              label="Select all"
              indeterminate
              supportingText="3 of 7 items selected."
            />
            <Checkbox
              size={size}
              label="Disabled option"
              supportingText="This option cannot be changed."
              disabled
            />
            <Checkbox
              size={size}
              label="Disabled checked"
              supportingText="This option is locked as selected."
              disabled
              defaultChecked
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sizes</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>sm (16px) · md (20px) · lg (24px)</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
        {(['sm', 'md', 'lg'] as CheckboxSize[]).map(size => (
          <Checkbox
            key={size}
            size={size}
            label={`size="${size}"`}
            supportingText="Supporting text for this option."
            defaultChecked
          />
        ))}
      </div>
    </div>
  ),
};

// ─── Interactive: Select All ──────────────────────────────────────────────────

export const SelectAll: Story = {
  name: 'Select All (Indeterminate)',
  render: () => {
    const items = [
      'Product analytics',
      'User session recordings',
      'A/B test results',
      'Heatmaps',
    ];
    const [selected, setSelected] = useState<Set<string>>(new Set(['Product analytics']));

    const allChecked   = selected.size === items.length;
    const someChecked  = selected.size > 0 && !allChecked;

    const toggleAll = () => {
      setSelected(allChecked ? new Set() : new Set(items));
    };

    const toggle = (item: string) => {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(item) ? next.delete(item) : next.add(item);
        return next;
      });
    };

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Select All — Indeterminate</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>
          Parent checkbox becomes indeterminate when some (not all) items are selected.
        </p>

        <div style={{ maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Parent */}
          <div style={{ padding: '12px 16px', borderRadius: '8px 8px 0 0', border: '1px solid #DEE1E6', background: '#F7F8F9' }}>
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
              label="Select all features"
              supportingText={`${selected.size} of ${items.length} selected`}
              size="md"
            />
          </div>

          {/* Children */}
          <div style={{ border: '1px solid #DEE1E6', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            {items.map((item, i) => (
              <div
                key={item}
                style={{
                  padding: '12px 16px 12px 32px',
                  borderTop: i > 0 ? '1px solid #EFF0F3' : 'none',
                }}
              >
                <Checkbox
                  checked={selected.has(item)}
                  onChange={() => toggle(item)}
                  label={item}
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// ─── Interactive: Form ────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive Form',
  render: () => {
    const [agreed, setAgreed] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Consent Checkboxes</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>Form with required validation</p>

        <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Checkbox
            checked={agreed}
            onChange={setAgreed}
            label="I agree to the Terms and Conditions"
            supportingText="Required. Read our Terms of Service and Privacy Policy."
            size="md"
          />

          <Checkbox
            checked={marketing}
            onChange={setMarketing}
            label="Send me product updates and news"
            supportingText="Optional. You can unsubscribe at any time."
            size="md"
          />

          {submitted && !agreed && (
            <p style={{ fontSize: 14, color: '#DA2110', marginTop: -8 }}>
              You must agree to the Terms and Conditions to continue.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setSubmitted(true)}
              style={{
                padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: agreed ? '#00AF43' : '#EFF0F3',
                color: agreed ? 'white' : '#BDC3CD',
                border: 'none', cursor: agreed ? 'pointer' : 'not-allowed',
              }}
            >
              Continue
            </button>
            <button
              onClick={() => { setAgreed(false); setMarketing(false); setSubmitted(false); }}
              style={{
                padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: 'transparent', color: '#495569', border: '1px solid #DEE1E6', cursor: 'pointer',
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

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>size × checked × indeterminate × disabled</p>

      {(['sm', 'md', 'lg'] as CheckboxSize[]).map(size => (
        <div key={size} style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 20 }}>
            size="{size}"
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <Checkbox size={size} label="Unchecked" supportingText="Default state." />
            <Checkbox size={size} label="Checked" supportingText="Selected." defaultChecked />
            <Checkbox size={size} label="Indeterminate" supportingText="Partial selection." indeterminate />
            <Checkbox size={size} label="Disabled" supportingText="Locked." disabled />
            <Checkbox size={size} label="Disabled checked" supportingText="Locked on." disabled defaultChecked />
            <Checkbox size={size} label="Disabled indet." supportingText="Locked partial." disabled indeterminate />
          </div>
        </div>
      ))}
    </div>
  ),
};
