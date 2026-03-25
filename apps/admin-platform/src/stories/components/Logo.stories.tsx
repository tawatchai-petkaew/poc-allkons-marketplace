import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AllkonsLogo } from '@/design-system';
import type { AllkonsLogoProps, AllkonsLogoTheme, AllkonsLogoSize, AllkonsLogoVariant } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<AllkonsLogoProps> = {
  title: 'Design System/Components/Logo',
  component: AllkonsLogo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**AllkonsLogo** — Allkons Design System

Source: [Figma DS1 → Logo/Company](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001524-18877)

Pre-exported SVGs per \`variant × theme × size\` stored at \`public/images/logo/{variant}/{theme}-{size}.svg\`.

| Variant | Description |
|---|---|
| \`icon\` | Logo mark (people icon only) |
| \`text\` | Wordmark only |
| \`full\` | Icon + "Allkons" wordmark |
| \`mseller\` | Icon + "Allkons M Seller" wordmark |
        `.trim(),
      },
    },
  },
  argTypes: {
    theme: { control: 'radio', options: ['default', 'dark', 'light'] as AllkonsLogoTheme[] },
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] as AllkonsLogoSize[] },
    variant: { control: 'radio', options: ['icon', 'text', 'full', 'mseller'] as AllkonsLogoVariant[] },
  },
  args: {
    theme: 'default',
    size: 'xl',
    variant: 'full',
    alt: 'Allkons',
  },
};

export default meta;
type Story = StoryObj<AllkonsLogoProps>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const THEMES: AllkonsLogoTheme[] = ['default', 'dark', 'light'];
const SIZES: AllkonsLogoSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const themeBg: Record<AllkonsLogoTheme, string> = {
  default: '#FFFFFF',
  dark: '#1A2232',
  light: '#0F52BA',
};

const ThemeRow = ({ theme, children }: { theme: AllkonsLogoTheme; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
      Theme: {theme}
    </p>
    <div
      style={{
        background: themeBg[theme],
        borderRadius: 8,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        alignItems: 'center',
        border: theme === 'default' ? '1px solid #E5E9F0' : 'none',
      }}
    >
      {children}
    </div>
  </div>
);

const SizeLabel = ({ size, children }: { size: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
    {children}
    <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace' }}>{size}</span>
  </div>
);

// ─── Interactive (Playground) ─────────────────────────────────────────────────

export const Playground: Story = {
  name: 'Playground',
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const FullLogo: Story = {
  name: 'Full Logo',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Full Logo</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        variant=&quot;full&quot; — Icon mark + &quot;Allkons&quot; wordmark
      </p>

      {THEMES.map(theme => (
        <ThemeRow key={theme} theme={theme}>
          {SIZES.map(size => (
            <SizeLabel key={size} size={size}>
              <AllkonsLogo variant="full" theme={theme} size={size} />
            </SizeLabel>
          ))}
        </ThemeRow>
      ))}
    </div>
  ),
};

export const MSeller: Story = {
  name: 'M Seller Logo',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>M Seller Logo</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        variant=&quot;mseller&quot; — Icon mark + &quot;Allkons M Seller&quot; wordmark
      </p>

      {THEMES.map(theme => (
        <ThemeRow key={theme} theme={theme}>
          {SIZES.map(size => (
            <SizeLabel key={size} size={size}>
              <AllkonsLogo variant="mseller" theme={theme} size={size} />
            </SizeLabel>
          ))}
        </ThemeRow>
      ))}
    </div>
  ),
};

export const IconMark: Story = {
  name: 'Icon Mark',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Icon Mark</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        variant=&quot;icon&quot; — People mark only (xs=16px → xl=40px)
      </p>

      {THEMES.map(theme => (
        <ThemeRow key={theme} theme={theme}>
          {SIZES.map(size => (
            <SizeLabel key={size} size={size}>
              <AllkonsLogo variant="icon" theme={theme} size={size} />
            </SizeLabel>
          ))}
        </ThemeRow>
      ))}
    </div>
  ),
};

export const Wordmark: Story = {
  name: 'Wordmark',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Wordmark</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        variant=&quot;text&quot; — &quot;Allkons&quot; text only (xs=16px → xl=40px)
      </p>

      {THEMES.map(theme => (
        <ThemeRow key={theme} theme={theme}>
          {SIZES.map(size => (
            <SizeLabel key={size} size={size}>
              <AllkonsLogo variant="text" theme={theme} size={size} />
            </SizeLabel>
          ))}
        </ThemeRow>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All Variants</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        Default theme · XL size — all 4 variants side by side
      </p>

      <ThemeRow theme="default">
        {(['full', 'mseller', 'icon', 'text'] as AllkonsLogoVariant[]).map(variant => (
          <SizeLabel key={variant} size={variant}>
            <AllkonsLogo variant={variant} theme="default" size="xl" />
          </SizeLabel>
        ))}
      </ThemeRow>

      <ThemeRow theme="dark">
        {(['full', 'mseller', 'icon', 'text'] as AllkonsLogoVariant[]).map(variant => (
          <SizeLabel key={variant} size={variant}>
            <AllkonsLogo variant={variant} theme="dark" size="xl" />
          </SizeLabel>
        ))}
      </ThemeRow>

      <ThemeRow theme="light">
        {(['full', 'mseller', 'icon', 'text'] as AllkonsLogoVariant[]).map(variant => (
          <SizeLabel key={variant} size={variant}>
            <AllkonsLogo variant={variant} theme="light" size="xl" />
          </SizeLabel>
        ))}
      </ThemeRow>
    </div>
  ),
};
