import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TextField, TextArea } from '@/design-system';
import type { TextFieldProps, TextFieldSize } from '@/design-system';

// ─── Inline SVG icon library ──────────────────────────────────────────────────
// All icons share the same currentColor + viewBox so they inherit the field's
// icon tint automatically.

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconDollar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Icon registry ─────────────────────────────────────────────────────────────

type IconName =
  | 'none'
  | 'search'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'alert'
  | 'user'
  | 'phone'
  | 'calendar'
  | 'link'
  | 'dollar'
  | 'globe'
  | 'message'
  | 'check'
  | 'chevron-down'
  | 'close';

const ICON_MAP: Record<IconName, React.ReactNode> = {
  none:          undefined,
  search:        <IconSearch />,
  mail:          <IconMail />,
  lock:          <IconLock />,
  eye:           <IconEye />,
  alert:         <IconAlert />,
  user:          <IconUser />,
  phone:         <IconPhone />,
  calendar:      <IconCalendar />,
  link:          <IconLink />,
  dollar:        <IconDollar />,
  globe:         <IconGlobe />,
  message:       <IconMessage />,
  check:         <IconCheck />,
  'chevron-down':<IconChevronDown />,
  close:         <IconClose />,
};

const ICON_OPTIONS: IconName[] = Object.keys(ICON_MAP) as IconName[];

// ─── Extended story args (adds icon-name selectors on top of TextFieldProps) ──

interface PlaygroundArgs extends TextFieldProps {
  leadingIconName:  IconName;
  trailingIconName: IconName;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<PlaygroundArgs> = {
  title: 'Design System/Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**TextField / TextArea** — Allkons Design System

Sources:
- [Figma: InputTextFieldDefault](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001706-30748)
- [Figma: InputTextFieldLeadAndTrailText](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40008551-20576)
- [Figma: InputTextFieldTextArea](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40007981-32742)
- [Figma: InputTextFieldNumber](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40015667-56791)

\`\`\`tsx
<TextField label="Email" placeholder="you@example.com" />
<TextField label="Search" placeholder="Search…" leadingIcon={<SearchIcon />} />
<TextField label="Price"  placeholder="0.00" leadingText="$" trailingText="USD" />
<TextField label="Email"  destructive helperText="Invalid email address." />
<TextArea  label="Message" placeholder="Enter your message…" />
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    // ── Core ──
    size:            { control: 'radio',  options: ['sm', 'md', 'lg'] as TextFieldSize[], table: { category: 'Core' } },
    destructive:     { control: 'boolean', table: { category: 'Core' } },
    showAsterisk:    { control: 'boolean', table: { category: 'Core' } },
    disabled:        { control: 'boolean', table: { category: 'Core' } },

    // ── Content ──
    label:           { control: 'text', table: { category: 'Content' } },
    placeholder:     { control: 'text', table: { category: 'Content' } },
    helperText:      { control: 'text', table: { category: 'Content' } },
    leadingText:     { control: 'text', table: { category: 'Content' } },
    trailingText:    { control: 'text', table: { category: 'Content' } },

    // ── Icon picker ──
    leadingIconName: {
      name: 'leadingIcon',
      control: 'select',
      options: ICON_OPTIONS,
      description: 'Icon shown on the left inside the field',
      table: { category: 'Icons' },
    },
    trailingIconName: {
      name: 'trailingIcon',
      control: 'select',
      options: ICON_OPTIONS,
      description: 'Icon shown on the right inside the field',
      table: { category: 'Icons' },
    },

    // ── Hide raw node props — replaced by name selectors ──
    leadingIcon:  { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
  },
  args: {
    size:             'md',
    destructive:      false,
    showAsterisk:     false,
    disabled:         false,
    label:            'Label',
    placeholder:      'Placeholder text',
    helperText:       '',
    leadingText:      '',
    trailingText:     '',
    leadingIconName:  'none',
    trailingIconName: 'none',
  },
};

export default meta;
type Story = StoryObj<PlaygroundArgs>;

// ─── Helper: resolve icon name → node ────────────────────────────────────────

function resolveIcon(name: IconName): React.ReactNode {
  return name === 'none' ? undefined : ICON_MAP[name];
}

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: ({ leadingIconName, trailingIconName, ...args }) => (
    <div style={{ maxWidth: 400 }}>
      <TextField
        {...args}
        leadingIcon={resolveIcon(leadingIconName)}
        trailingIcon={resolveIcon(trailingIconName)}
      />
    </div>
  ),
};

// ─── Icon Picker Preview ──────────────────────────────────────────────────────

export const IconPicker: Story = {
  name: 'Icon Picker',
  parameters: {
    docs: {
      description: {
        story: 'Use the **Controls** panel to pick a leading/trailing icon, toggle disabled/destructive, and change size — all live.',
      },
    },
  },
  args: {
    label:            'Amount',
    placeholder:      '0.00',
    helperText:       'Enter the total amount.',
    leadingIconName:  'dollar',
    trailingIconName: 'chevron-down',
    showAsterisk:     true,
  },
  render: ({ leadingIconName, trailingIconName, ...args }) => (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Live preview */}
      <TextField
        {...args}
        leadingIcon={resolveIcon(leadingIconName)}
        trailingIcon={resolveIcon(trailingIconName)}
      />

      {/* Icon gallery */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Available icons
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICON_OPTIONS.filter(n => n !== 'none').map(name => (
            <div
              key={name}
              title={name}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 10px', borderRadius: 8, border: '1px solid #DEE1E6',
                background: (leadingIconName === name || trailingIconName === name) ? '#E5F7EC' : 'white',
                minWidth: 60,
              }}
            >
              <span style={{ width: 20, height: 20, color: '#495569', display: 'flex' }}>
                {ICON_MAP[name]}
              </span>
              <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  name: 'States',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>States</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        Default · Filled · Disabled · Destructive (empty) · Destructive (filled) · Destructive (disabled)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 880 }}>
        <TextField
          label="Default"
          placeholder="Placeholder text"
          helperText="Helper text goes here."
          showAsterisk
        />
        <TextField
          label="Filled"
          defaultValue="Jane Doe"
          helperText="Helper text goes here."
          showAsterisk
        />
        <TextField
          label="Disabled"
          placeholder="Placeholder text"
          helperText="You cannot edit this field."
          disabled
          showAsterisk
        />
        <TextField
          label="Disabled (filled)"
          defaultValue="Locked value"
          helperText="You cannot edit this field."
          disabled
          showAsterisk
        />
        <TextField
          label="Destructive — empty"
          placeholder="Placeholder text"
          destructive
          helperText="This field is required."
          showAsterisk
        />
        <TextField
          label="Destructive — filled"
          defaultValue="invalid@"
          destructive
          helperText="Please enter a valid email."
          showAsterisk
        />
        <TextField
          label="With icon — default"
          placeholder="Search…"
          leadingIcon={<IconSearch />}
          helperText="Helper text."
        />
        <TextField
          label="With icon — disabled"
          placeholder="Locked field"
          leadingIcon={<IconLock />}
          trailingIcon={<IconEye />}
          disabled
          helperText="You cannot edit this field."
        />
      </div>
    </div>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sizes</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>sm · md · lg — default, with icon, disabled</p>

      {(['sm', 'md', 'lg'] as TextFieldSize[]).map(size => (
        <div key={size} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>
            size="{size}"
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 880 }}>
            <TextField size={size} label="Default" placeholder="Placeholder" helperText="Helper text." />
            <TextField size={size} label="With icon" placeholder="Search…" leadingIcon={<IconSearch />} trailingIcon={<IconChevronDown />} />
            <TextField size={size} label="Disabled" placeholder="Locked" disabled helperText="Cannot edit." />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── With Icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>With Icons</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        leadingIcon · trailingIcon · both · destructive · disabled
      </p>

      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TextField label="Leading icon" placeholder="Search…" leadingIcon={<IconSearch />} helperText="Search for anything." />
        <TextField label="Trailing icon" placeholder="Password" type="password" trailingIcon={<IconEye />} />
        <TextField label="Both icons" placeholder="Email address" leadingIcon={<IconMail />} trailingIcon={<IconAlert />} destructive helperText="Invalid email address." />
        <TextField label="Leading + disabled" placeholder="Locked field" leadingIcon={<IconLock />} disabled helperText="Contact support to edit." />
        <TextField label="Trailing + disabled" placeholder="username" trailingIcon={<IconUser />} disabled />
        <TextField label="Both + disabled" placeholder="website.com" leadingIcon={<IconGlobe />} trailingIcon={<IconLink />} disabled helperText="This field is locked." />
      </div>
    </div>
  ),
};

// ─── With Text Addons ─────────────────────────────────────────────────────────

export const WithTextAddons: Story = {
  name: 'With Text Addons',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>With Text Addons</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        leadingText · trailingText · both — currency symbol, unit suffix, URL prefix
      </p>

      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <TextField label="Price" placeholder="0.00" type="number" leadingText="$" helperText="Enter amount in USD." />
        <TextField label="Website" placeholder="yoursite" leadingText="https://" trailingText=".com" />
        <TextField label="Weight" placeholder="0" type="number" trailingText="kg" />
        <TextField label="Both — destructive" placeholder="0.00" leadingText="฿" trailingText="THB" destructive helperText="Amount must be greater than 0." />
        <TextField label="Both — disabled" placeholder="0.00" leadingText="$" trailingText="USD" disabled />
      </div>
    </div>
  ),
};

// ─── TextArea ─────────────────────────────────────────────────────────────────

export const TextAreaStory: Story = {
  name: 'TextArea',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TextArea</h2>
      <p style={{ color: '#7C889C', marginBottom: 40 }}>
        Multi-line · resizable · min 120px / max 480px · same states as TextField
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 880 }}>
        <TextArea label="Default" placeholder="Write your message here…" helperText="Maximum 500 characters." showAsterisk />
        <TextArea label="Filled" defaultValue="This is a filled textarea with some sample text that spans multiple words." helperText="Helper text." showAsterisk />
        <TextArea label="With icons" placeholder="Write your message here…" leadingIcon={<IconMessage />} trailingIcon={<IconAlert />} />
        <TextArea label="Destructive" placeholder="Write your message here…" destructive helperText="This field is required." showAsterisk />
        <TextArea label="Disabled" placeholder="This field is disabled" disabled helperText="Contact support to edit." />
        <TextArea label="Disabled (filled)" defaultValue="This content is locked and cannot be changed." disabled helperText="Contact support to edit." />
      </div>

      <div style={{ marginTop: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16 }}>Sizes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 440 }}>
          {(['sm', 'md', 'lg'] as TextFieldSize[]).map(size => (
            <TextArea key={size} label={`size="${size}"`} placeholder="Placeholder text…" size={size} />
          ))}
        </div>
      </div>
    </div>
  ),
};

// ─── Interactive Form ─────────────────────────────────────────────────────────

export const Interactive: Story = {
  name: 'Interactive Form',
  render: () => {
    const [values, setValues] = useState({ email: '', password: '', website: '', price: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const emailInvalid  = submitted && !values.email.includes('@');
    const passInvalid   = submitted && values.password.length < 8;
    const msgInvalid    = submitted && values.message.trim() === '';

    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Interactive Form</h2>
        <p style={{ color: '#7C889C', marginBottom: 32 }}>Click Submit to see validation states</p>

        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TextField
            label="Email address" placeholder="you@example.com" type="email"
            leadingIcon={<IconMail />}
            value={values.email} onChange={e => setValues(v => ({ ...v, email: e.target.value }))}
            destructive={emailInvalid} helperText={emailInvalid ? 'Please enter a valid email address.' : ''} showAsterisk
          />
          <TextField
            label="Password" placeholder="Min 8 characters" type="password"
            leadingIcon={<IconLock />} trailingIcon={<IconEye />}
            value={values.password} onChange={e => setValues(v => ({ ...v, password: e.target.value }))}
            destructive={passInvalid} helperText={passInvalid ? 'Password must be at least 8 characters.' : ''} showAsterisk
          />
          <TextField
            label="Website" placeholder="yoursite"
            leadingText="https://" trailingText=".com"
            value={values.website} onChange={e => setValues(v => ({ ...v, website: e.target.value }))}
          />
          <TextField
            label="Price" placeholder="0.00" type="number"
            leadingText="฿" trailingText="THB"
            value={values.price} onChange={e => setValues(v => ({ ...v, price: e.target.value }))}
          />
          <TextArea
            label="Message" placeholder="Tell us more…"
            value={values.message} onChange={e => setValues(v => ({ ...v, message: e.target.value }))}
            destructive={msgInvalid} helperText={msgInvalid ? 'Message is required.' : `${values.message.length} / 500 characters`} showAsterisk
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={() => setSubmitted(true)} style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: '#00AF43', color: 'white', border: 'none', cursor: 'pointer' }}>
              Submit
            </button>
            <button onClick={() => { setSubmitted(false); setValues({ email: '', password: '', website: '', price: '', message: '' }); }}
              style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: 'transparent', color: '#495569', border: '1px solid #DEE1E6', cursor: 'pointer' }}>
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
      <p style={{ color: '#7C889C', marginBottom: 40 }}>size × state × type</p>

      {(['sm', 'md', 'lg'] as TextFieldSize[]).map(size => (
        <div key={size} style={{ marginBottom: 56 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 24 }}>size="{size}"</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <TextField size={size} label="Default" placeholder="Placeholder" helperText="Helper text." showAsterisk />
            <TextField size={size} label="Destructive" placeholder="Placeholder" destructive helperText="Error message." showAsterisk />
            <TextField size={size} label="Disabled" placeholder="Placeholder" disabled helperText="Disabled state." />
            <TextField size={size} label="Lead icon" placeholder="Search…" leadingIcon={<IconSearch />} />
            <TextField size={size} label="Trail icon" placeholder="Password" trailingIcon={<IconEye />} />
            <TextField size={size} label="Both icons" placeholder="Email" leadingIcon={<IconMail />} trailingIcon={<IconAlert />} destructive helperText="Invalid email." />
            <TextField size={size} label="Lead text" placeholder="0.00" leadingText="$" />
            <TextField size={size} label="Trail text" placeholder="domain" trailingText=".com" />
            <TextField size={size} label="Both addons" placeholder="0.00" leadingText="฿" trailingText="THB" />
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 56 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: 24 }}>TextArea</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <TextArea label="Default" placeholder="Write here…" helperText="Helper text." showAsterisk />
          <TextArea label="Destructive" placeholder="Write here…" destructive helperText="Error message." showAsterisk />
          <TextArea label="Disabled" placeholder="Disabled" disabled helperText="Disabled state." />
        </div>
      </div>
    </div>
  ),
};
