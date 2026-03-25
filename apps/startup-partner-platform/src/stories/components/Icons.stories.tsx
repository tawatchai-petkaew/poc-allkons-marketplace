import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Dot,
  Bank,
  SocialIcon,
  FeatureIcon,
  PaymentIcon,
  CountryIcon,
  FileTypeIcon,
  FILE_TYPES_INTEGRATION,
  FILE_TYPES_FILLED,
} from '@/design-system';
import type { BankCode, SocialPlatform, SocialIconTheme, FeatureIconColor, FeatureIconType, FeatureIconRadius, FeatureIconSize, PaymentIconSize, PaymentMethod, FileType, FileTypeIconStyle } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/Icons',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#7C889C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
      {title}
    </h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    {children}
  </div>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 10, color: '#7C889C', fontFamily: 'monospace' }}>{children}</span>
);

// ─── Dot ──────────────────────────────────────────────────────────────────────

export const DotStory: Story = {
  name: 'Dot',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Dot</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        Figma: Dot — active/inactive × xs/sm/md/lg
      </p>

      <Section title="Active">
        {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
          <Label key={size}>
            <Dot size={size} active />
            <Caption>{size}</Caption>
          </Label>
        ))}
      </Section>

      <Section title="Inactive">
        {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
          <Label key={size}>
            <Dot size={size} active={false} />
            <Caption>{size}</Caption>
          </Label>
        ))}
      </Section>
    </div>
  ),
};

// ─── Bank ─────────────────────────────────────────────────────────────────────

const banks: BankCode[] = ['KTB', 'KBANK', 'SCB', 'BBL', 'BAY', 'TMB', 'TTB', 'UOB', 'CIMB', 'GHBANK', 'GSB', 'KK', 'LHBANK', 'TBANK', 'TISCO', 'BAAC'];

export const BankStory: Story = {
  name: 'Bank',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bank</h2>
      <p style={{ color: '#7C889C', marginBottom: 8 }}>
        Figma: Bank — 16 Thai banks, 80×80px, border-radius 12px
      </p>
      <p style={{ color: '#BDC3CD', fontSize: 12, marginBottom: 32 }}>
        Place logo SVGs at <code>{'public/images/icons/banks/{BANKCODE}.svg'}</code>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {banks.map(code => (
          <Label key={code}>
            <Bank bank={code} />
            <Caption>{code}</Caption>
          </Label>
        ))}
      </div>
    </div>
  ),
};

// ─── Social Icons ─────────────────────────────────────────────────────────────

const socialPlatforms: SocialPlatform[] = [
  'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'Youtube',
  'Github', 'Google', 'Apple', 'Discord', 'Telegram',
  'Snapchat', 'Pinterest', 'Reddit', 'Figma', 'Dribbble',
  'Tumblr', 'Clubhouse', 'Gumroad', 'PlayMarket', 'AngelList',
];
const socialThemes: SocialIconTheme[] = ['Brand', 'Dark', 'White'];

export const SocialIconStory: Story = {
  name: 'SocialIcon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Social Icons</h2>
      <p style={{ color: '#7C889C', marginBottom: 8 }}>
        Figma: SocialIcons — Brand/Dark/White × 20 platforms, 24×24px
      </p>
      <p style={{ color: '#BDC3CD', fontSize: 12, marginBottom: 32 }}>
        Place SVGs at <code>{'public/images/icons/social/{Theme}/{Platform}.svg'}</code>
      </p>

      {socialThemes.map(theme => (
        <Section key={theme} title={`Theme: ${theme}`}>
          {socialPlatforms.map(platform => (
            <Label key={platform}>
              <span style={{ background: theme === 'White' ? '#242A34' : 'transparent', padding: 4, borderRadius: 4, display: 'inline-flex' }}>
                <SocialIcon platform={platform} theme={theme} />
              </span>
              <Caption>{platform}</Caption>
            </Label>
          ))}
        </Section>
      ))}
    </div>
  ),
};

// ─── Feature Icons ────────────────────────────────────────────────────────────

const featureColors: FeatureIconColor[] = ['Brand', 'Gray', 'Success', 'Warning', 'Error', 'Info', 'Pink'];
const featureTypes: FeatureIconType[] = ['Light', 'Dark', 'Modern'];
const featureRadii: FeatureIconRadius[] = ['Rounded', 'Full-Rounded'];
const featureSizes: FeatureIconSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

// Simple star SVG as placeholder icon
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const FeatureIconStory: Story = {
  name: 'FeatureIcon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Feature Icon</h2>
      <p style={{ color: '#7C889C', marginBottom: 32 }}>
        Figma: Feature icon — Size × Color × Type × Radius (252 variants). Pass any icon as children.
      </p>

      {featureTypes.map(type => (
        <div key={type} style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Type: {type}</h3>
          {featureRadii.map(radius => (
            <div key={radius} style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#7C889C', marginBottom: 8 }}>Radius: {radius}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                {featureColors.map(color => (
                  <Label key={color}>
                    <FeatureIcon size="lg" color={color} type={type} radius={radius}>
                      <StarIcon />
                    </FeatureIcon>
                    <Caption>{color}</Caption>
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>All Sizes (Brand / Light / Rounded)</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        {featureSizes.map(size => (
          <Label key={size}>
            <FeatureIcon size={size} color="Brand" type="Light" radius="Rounded">
              <StarIcon />
            </FeatureIcon>
            <Caption>{size}</Caption>
          </Label>
        ))}
      </div>
    </div>
  ),
};

// ─── Payment Icons ────────────────────────────────────────────────────────────

const paymentMethods: PaymentMethod[] = [
  'Visa', 'Mastercard', 'AMEX', 'Discover', 'JCB', 'UnionPay',
  'ApplePay', 'GooglePay', 'PayPal', 'Alipay',
  'Bitcoin', 'Ethereum', 'Stripe', 'Klarna',
];
const paymentSizes: PaymentIconSize[] = ['sm', 'md', 'lg'];

export const PaymentIconStory: Story = {
  name: 'PaymentIcon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Icons</h2>
      <p style={{ color: '#7C889C', marginBottom: 8 }}>
        Figma: Payment method icon — sm/md/lg × 40+ methods
      </p>
      <p style={{ color: '#BDC3CD', fontSize: 12, marginBottom: 32 }}>
        Place SVGs at <code>{'public/images/icons/payment/{Method}.svg'}</code>
      </p>

      {paymentSizes.map(size => (
        <Section key={size} title={`Size: ${size}`}>
          {paymentMethods.map(method => (
            <Label key={method}>
              <PaymentIcon method={method} size={size} />
              <Caption>{method}</Caption>
            </Label>
          ))}
        </Section>
      ))}
    </div>
  ),
};

// ─── Country Icons ────────────────────────────────────────────────────────────

const countries = ['TH', 'US', 'GB', 'JP', 'CN', 'KR', 'SG', 'AU', 'DE', 'FR', 'IN', 'BR', 'CA', 'MX', 'AE', 'SA'];

export const CountryIconStory: Story = {
  name: 'CountryIcon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Country Icons</h2>
      <p style={{ color: '#7C889C', marginBottom: 8 }}>
        Figma: Country icons — 200+ countries, 24×24px circular flags
      </p>
      <p style={{ color: '#BDC3CD', fontSize: 12, marginBottom: 32 }}>
        Place SVGs at <code>{'public/images/icons/countries/{COUNTRYCODE}.svg'}</code>
      </p>

      <Section title="Sample Countries">
        {countries.map(code => (
          <Label key={code}>
            <CountryIcon country={code} />
            <Caption>{code}</Caption>
          </Label>
        ))}
      </Section>
    </div>
  ),
};

// ─── File Type Icons ──────────────────────────────────────────────────────────

export const FileTypeIconStory: Story = {
  name: 'FileTypeIcon',
  render: () => (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>File Type Icons</h2>
      <p style={{ color: '#7C889C', marginBottom: 8 }}>
        Figma: FileType (node 40001861:12151) — Integration × Filled, 24×24px
      </p>
      <p style={{ color: '#BDC3CD', fontSize: 12, marginBottom: 32 }}>
        Integration: 8 brand logos (.png) + 3 generic (.svg) · Filled: 3 generic (.svg)
      </p>

      <Section title="Integration (11 types)">
        {FILE_TYPES_INTEGRATION.map(type => (
          <Label key={type}>
            <FileTypeIcon type={type} style="Integration" />
            <Caption>{type}</Caption>
          </Label>
        ))}
      </Section>

      <Section title="Filled (3 types)">
        {FILE_TYPES_FILLED.map(type => (
          <Label key={type}>
            <FileTypeIcon type={type} style="Filled" />
            <Caption>{type}</Caption>
          </Label>
        ))}
      </Section>
    </div>
  ),
};
