import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs } from '@/design-system';
import type { TabsProps, TabVariant, TabSize, TabsLayout } from '@/design-system';

// ─── Sample icons ─────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 1.5a4.5 4.5 0 00-4.5 4.5v2.5L2 10v1h12v-1l-1.5-1.5V6A4.5 4.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// ─── Sample items ──────────────────────────────────────────────────────────────

const BASIC_ITEMS = [
  { key: 'overview',  label: 'Overview'  },
  { key: 'analytics', label: 'Analytics' },
  { key: 'reports',   label: 'Reports'   },
  { key: 'users',     label: 'Users'     },
];

const ICON_ITEMS = [
  { key: 'home',      label: 'Home',      icon: <HomeIcon />     },
  { key: 'profile',   label: 'Profile',   icon: <UserIcon />     },
  { key: 'settings',  label: 'Settings',  icon: <SettingsIcon /> },
  { key: 'alerts',    label: 'Alerts',    icon: <BellIcon />     },
];

const BADGE_ITEMS = [
  { key: 'all',      label: 'All',      badge: 48              },
  { key: 'open',     label: 'Open',     badge: 12              },
  { key: 'pending',  label: 'Pending',  badge: 5               },
  { key: 'resolved', label: 'Resolved', badge: 31              },
];

const PANEL_ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    children: (
      <div className="p-4 rounded-[8px] bg-background-secondary text-text-secondary text-sm">
        Overview panel content — summary charts, KPIs, and recent activity.
      </div>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics',
    children: (
      <div className="p-4 rounded-[8px] bg-background-secondary text-text-secondary text-sm">
        Analytics panel — detailed metrics, funnels, and cohort analysis.
      </div>
    ),
  },
  {
    key: 'reports',
    label: 'Reports',
    children: (
      <div className="p-4 rounded-[8px] bg-background-secondary text-text-secondary text-sm">
        Reports panel — scheduled exports, custom report builder.
      </div>
    ),
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<TabsProps> = {
  title: 'Design System/Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Tabs** — Allkons Design System

Sources:
- [Figma: _Tab button base](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002553-5457)
- [Figma: Horizontal tabs](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002553-8293)
- [Figma: Vertical tabs](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002553-14581)

\`\`\`tsx
<Tabs
  items={[
    { key: 'a', label: 'Tab A' },
    { key: 'b', label: 'Tab B' },
    { key: 'c', label: 'Tab C' },
  ]}
  defaultActiveKey="a"
  variant="underline"
  size="md"
  layout="horizontal"
  onChange={key => console.log(key)}
/>
\`\`\`
        `.trim(),
      },
    },
  },
  argTypes: {
    variant:   { control: 'radio',   options: ['underline', 'button-brand', 'button-gray', 'button-white', 'button-dark-brand', 'pill'] as TabVariant[] },
    size:      { control: 'radio',   options: ['sm', 'md', 'lg'] as TabSize[] },
    layout:    { control: 'radio',   options: ['horizontal', 'vertical'] as TabsLayout[] },
    fullWidth: { control: 'boolean' },
  },
  args: {
    variant:   'underline',
    size:      'md',
    layout:    'horizontal',
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<TabsProps>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
  render: (args) => {
    const [active, setActive] = useState(BASIC_ITEMS[0].key);
    return (
      <Tabs
        {...args}
        items={BASIC_ITEMS}
        activeKey={active}
        onChange={setActive}
      />
    );
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  name: 'Variants',
  render: () => {
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-white', 'button-dark-brand', 'pill'];
    const [active, setActive] = useState<Record<TabVariant, string>>({
      'underline':          'overview',
      'button-brand':       'overview',
      'button-gray':        'overview',
      'button-white':       'overview',
      'button-dark-brand':  'overview',
      'pill':               'overview',
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>Variants</h2>

        {variants.map(variant => (
          <div key={variant} style={{ background: variant === 'button-white' ? '#F7F8F9' : 'white', padding: 24, borderRadius: 12, border: '1px solid #EFF0F3' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}"
            </p>
            <Tabs
              items={BASIC_ITEMS}
              variant={variant}
              activeKey={active[variant]}
              onChange={k => setActive(v => ({ ...v, [variant]: k }))}
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
  render: () => {
    const sizes: TabSize[] = ['sm', 'md', 'lg'];
    const labels: Record<TabSize, string> = { sm: '32px', md: '40px', lg: '48px' };
    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(sizes.map(s => [s, 'overview']))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>Sizes</h2>

        {sizes.map(size => (
          <div key={size}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              size="{size}" — {labels[size]} tab height
            </p>
            <Tabs
              items={BASIC_ITEMS}
              size={size}
              activeKey={active[size]}
              onChange={k => setActive(v => ({ ...v, [size]: k }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Layouts ──────────────────────────────────────────────────────────────────

export const Layouts: Story = {
  name: 'Layouts',
  render: () => {
    const [hKey, setHKey] = useState('overview');
    const [vKey, setVKey] = useState('overview');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>Layouts</h2>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            layout="horizontal"
          </p>
          <Tabs items={BASIC_ITEMS} layout="horizontal" activeKey={hKey} onChange={setHKey} />
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            layout="vertical"
          </p>
          <div style={{ width: 200 }}>
            <Tabs items={BASIC_ITEMS} layout="vertical" activeKey={vKey} onChange={setVKey} />
          </div>
        </div>
      </div>
    );
  },
};

// ─── With Icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => {
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-dark-brand', 'pill'];
    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(variants.map(v => [v, 'home']))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>With Icons</h2>

        {variants.map(variant => (
          <div key={variant}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}"
            </p>
            <Tabs
              items={ICON_ITEMS}
              variant={variant}
              activeKey={active[variant]}
              onChange={k => setActive(v => ({ ...v, [variant]: k }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── With Badges ──────────────────────────────────────────────────────────────

export const WithBadges: Story = {
  name: 'With Badges',
  render: () => {
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-dark-brand', 'pill'];
    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(variants.map(v => [v, 'all']))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>With Badges</h2>

        {variants.map(variant => (
          <div key={variant}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}"
            </p>
            <Tabs
              items={BADGE_ITEMS}
              variant={variant}
              activeKey={active[variant]}
              onChange={k => setActive(v => ({ ...v, [variant]: k }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Closable Tabs ────────────────────────────────────────────────────────────

export const Closable: Story = {
  name: 'Closable',
  render: () => {
    const initial = [
      { key: 'tab-1', label: 'Dashboard',  closable: true },
      { key: 'tab-2', label: 'Orders',     closable: true },
      { key: 'tab-3', label: 'Customers',  closable: true },
      { key: 'tab-4', label: 'Reports',    closable: true },
      { key: 'tab-5', label: 'Settings'                    },
    ];
    const [items, setItems] = useState(initial);
    const [active, setActive] = useState('tab-1');

    const handleClose = (key: string) => {
      const idx  = items.findIndex(i => i.key === key);
      const next = items[idx + 1] ?? items[idx - 1];
      setItems(v => v.filter(i => i.key !== key));
      if (active === key && next) setActive(next.key);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -8 }}>Closable</h2>
        <p style={{ color: '#7C889C', marginBottom: 8 }}>
          Click × to close a tab. Settings tab is not closable.
        </p>
        <Tabs
          items={items}
          activeKey={active}
          onChange={setActive}
          onClose={handleClose}
        />
        {items.length === 0 && (
          <p style={{ color: '#DA2110', fontSize: 14 }}>All closable tabs removed.</p>
        )}
      </div>
    );
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  name: 'Disabled',
  render: () => {
    const items = [
      { key: 'a', label: 'Active tab'           },
      { key: 'b', label: 'Disabled tab', disabled: true },
      { key: 'c', label: 'Another tab'          },
      { key: 'd', label: 'Also disabled', disabled: true },
    ];
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-dark-brand', 'pill'];
    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(variants.map(v => [v, 'a']))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>Disabled</h2>

        {variants.map(variant => (
          <div key={variant}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}"
            </p>
            <Tabs
              items={items}
              variant={variant}
              activeKey={active[variant]}
              onChange={k => setActive(v => ({ ...v, [variant]: k }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── Full Width ───────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: 'Full Width',
  render: () => {
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-dark-brand', 'pill'];
    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(variants.map(v => [v, 'overview']))
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -16 }}>Full Width</h2>

        {variants.map(variant => (
          <div key={variant}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              variant="{variant}" fullWidth
            </p>
            <Tabs
              items={BASIC_ITEMS}
              variant={variant}
              fullWidth
              activeKey={active[variant]}
              onChange={k => setActive(v => ({ ...v, [variant]: k }))}
            />
          </div>
        ))}
      </div>
    );
  },
};

// ─── With Panels ──────────────────────────────────────────────────────────────

export const WithPanels: Story = {
  name: 'With Panels',
  render: () => {
    const [hActive, setHActive] = useState('overview');
    const [vActive, setVActive] = useState('overview');

    const vItems = PANEL_ITEMS.map(item => ({
      ...item,
      icon: item.key === 'overview' ? <HomeIcon /> : item.key === 'analytics' ? <UserIcon /> : <FileIcon />,
    }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>With Panels</h2>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Horizontal with content panels
          </p>
          <Tabs
            items={PANEL_ITEMS}
            activeKey={hActive}
            onChange={setHActive}
          />
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#495569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Vertical with icons + content panels
          </p>
          <Tabs
            items={vItems}
            layout="vertical"
            activeKey={vActive}
            onChange={setVActive}
          />
        </div>
      </div>
    );
  },
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => {
    const variants: TabVariant[] = ['underline', 'button-brand', 'button-gray', 'button-white', 'button-dark-brand', 'pill'];
    const sizes: TabSize[] = ['sm', 'md', 'lg'];

    const [active, setActive] = useState<Record<string, string>>(
      Object.fromEntries(
        variants.flatMap(v => sizes.map(s => [`${v}-${s}`, 'overview']))
      )
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: -24 }}>All Variants × Sizes</h2>

        {variants.map(variant => (
          <div key={variant} style={{ background: variant === 'button-white' ? '#F7F8F9' : 'white', padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#37404F', marginBottom: -16 }}>
              variant="{variant}"
            </h3>

            {sizes.map(size => {
              const k = `${variant}-${size}`;
              return (
                <div key={size}>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9DA6B5', marginBottom: 12 }}>
                    size="{size}"
                  </p>
                  <Tabs
                    items={ICON_ITEMS}
                    variant={variant}
                    size={size}
                    activeKey={active[k]}
                    onChange={v => setActive(a => ({ ...a, [k]: v }))}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
};
