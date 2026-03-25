import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@/design-system';
import type { ButtonProps } from '@/design-system';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<ButtonProps> = {
  title: 'Design System/Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Button** — Allkons Design System

Source: [Figma DS1 → Button](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40001561-21343)

> Rendered with native \`<button>\` + Tailwind CSS via CVA — no Ant Design wrapper, no CSS specificity conflicts.

**Variants (Figma: Variant × Color)**
| variant | Figma | Use case |
|---------|-------|----------|
| \`primary-brand\` | Primary / Brand / Filled | Main CTA |
| \`primary-error\` | Primary / Error / Filled | Destructive action |
| \`secondary-brand\` | Secondary / Brand / Outline | Secondary CTA |
| \`secondary-neutral\` | Secondary / Neutral / Outline | Cancel, neutral |
| \`secondary-error\` | Secondary / Error / Outline | Soft destructive |
| \`tertiary-brand\` | Tertiary / Brand / Ghost | Subtle action |
| \`tertiary-neutral\` | Tertiary / Neutral / Ghost | Low emphasis |
| \`tertiary-error\` | Tertiary / Error / Ghost | Soft error |
| \`link-brand\` | Link / Brand | In-text links |
| \`link-neutral\` | Link / Neutral | Muted links |
| \`link-error\` | Link / Error | Destructive link |

**Sizes**
| size | Height | Font |
|------|--------|------|
| \`lg\` | 48px | 18px |
| \`md\` | 40px (default) | 16px |
| \`sm\` | 32px | 14px |
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary-brand', 'primary-error',
        'secondary-brand', 'secondary-neutral', 'secondary-error',
        'tertiary-brand', 'tertiary-neutral', 'tertiary-error',
        'link-brand', 'link-neutral', 'link-error',
      ],
      description: 'Visual variant (Figma: Variant × Color)',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'lg=48px | md=40px | sm=32px',
    },
    fullWidth:  { control: 'boolean' },
    iconOnly:   { control: 'boolean' },
    loading:    { control: 'boolean' },
    disabled:   { control: 'boolean' },
    children:   { control: 'text' },
    startIcon:  { control: false },
    endIcon:    { control: false },
    htmlType:   { control: 'radio', options: ['button', 'submit', 'reset'] },
  },
  args: {
    children:  'Label',
    variant:   'primary-brand',
    size:      'md',
    fullWidth:  false,
    iconOnly:   false,
    loading:    false,
    disabled:   false,
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

// ─── Shared helpers ────────────────────────────────────────────────────────────

const Icon = () => (
  <i className="ri-add-line text-[18px] leading-none" />
);

const Label = ({ text, color = '#9DA6B5' }: { text: string; color?: string }) => (
  <span style={{ fontSize: 10, fontFamily: 'monospace', color, display: 'block', marginBottom: 4 }}>
    {text}
  </span>
);

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    iconOnly: false
  }
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-8 min-w-[700px]">
      <h2 className="text-xl font-bold text-[#12151A]">Button — All Variants</h2>
      <p className="text-sm text-[#7C889C]">Hover over each button to see hover state ↗</p>

      {/* Primary — Filled */}
      <section className="space-y-3">
        <h3 className="text-[11px] text-[#9DA6B5] uppercase tracking-[0.1em] font-semibold">
          Primary — Filled
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <Label text="primary-brand" />
            <Button variant="primary-brand">Brand</Button>
          </div>
          <div>
            <Label text="primary-error" />
            <Button variant="primary-error">Error</Button>
          </div>
          <div>
            <Label text="disabled" />
            <Button variant="primary-brand" disabled>Disabled</Button>
          </div>
          <div>
            <Label text="loading" />
            <Button variant="primary-brand" loading>Loading</Button>
          </div>
        </div>
      </section>

      {/* Secondary — Outline */}
      <section className="space-y-3">
        <h3 className="text-[11px] text-[#9DA6B5] uppercase tracking-[0.1em] font-semibold">
          Secondary — Outline
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <Label text="secondary-brand" />
            <Button variant="secondary-brand">Brand</Button>
          </div>
          <div>
            <Label text="secondary-neutral" />
            <Button variant="secondary-neutral">Neutral</Button>
          </div>
          <div>
            <Label text="secondary-error" />
            <Button variant="secondary-error">Error</Button>
          </div>
          <div>
            <Label text="disabled" />
            <Button variant="secondary-neutral" disabled>Disabled</Button>
          </div>
        </div>
      </section>

      {/* Tertiary — Ghost */}
      <section className="space-y-3">
        <h3 className="text-[11px] text-[#9DA6B5] uppercase tracking-[0.1em] font-semibold">
          Tertiary — Ghost
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <Label text="tertiary-brand" />
            <Button variant="tertiary-brand">Brand</Button>
          </div>
          <div>
            <Label text="tertiary-neutral" />
            <Button variant="tertiary-neutral">Neutral</Button>
          </div>
          <div>
            <Label text="tertiary-error" />
            <Button variant="tertiary-error">Error</Button>
          </div>
          <div>
            <Label text="disabled" />
            <Button variant="tertiary-brand" disabled>Disabled</Button>
          </div>
        </div>
      </section>

      {/* Link */}
      <section className="space-y-3">
        <h3 className="text-[11px] text-[#9DA6B5] uppercase tracking-[0.1em] font-semibold">
          Link
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <Label text="link-brand" />
            <Button variant="link-brand">Brand</Button>
          </div>
          <div>
            <Label text="link-neutral" />
            <Button variant="link-neutral">Neutral</Button>
          </div>
          <div>
            <Label text="link-error" />
            <Button variant="link-error">Error</Button>
          </div>
          <div>
            <Label text="disabled" />
            <Button variant="link-brand" disabled>Disabled</Button>
          </div>
        </div>
      </section>
    </div>
  ),
};

// ─── Hover Colors ─────────────────────────────────────────────────────────────
// Shows Default vs Hover side-by-side.
// "Hover" column uses forced className to simulate the hover state visually.

const HOVER_VARIANTS: Array<{
  variant: ButtonProps['variant'];
  label: string;
  defaultColors: string;
  hoverColors: string;
  hoverClass: string;
  darkBg?: boolean;
}> = [
  {
    variant: 'primary-brand',
    label: 'Primary Brand (Filled)',
    defaultColors: 'bg #00AF43 · text white',
    hoverColors: 'bg #008C36 · text #E5F7EC',
    hoverClass: 'bg-primary-hover border-primary-hover text-primary-subtle',
  },
  {
    variant: 'primary-error',
    label: 'Primary Error (Filled)',
    defaultColors: 'bg #DA2110 · text white',
    hoverColors: 'bg #AE1A0C · text #FBE8E7',
    hoverClass: 'bg-error-hover border-error-hover text-error-subtle',
  },
  {
    variant: 'secondary-brand',
    label: 'Secondary Brand (Outline)',
    defaultColors: 'bg transparent · text #008C36 · border #00AF43',
    hoverColors: 'bg #E5F7EC · text #006928 · border #008C36',
    hoverClass: 'bg-primary-subtle border-primary-border-hover text-primary-text-hover',
  },
  {
    variant: 'secondary-neutral',
    label: 'Secondary Neutral (Outline)',
    defaultColors: 'bg transparent · text #37404F · border #DEE1E6',
    hoverColors: 'bg #F7F8F9 · text #242A34 · border #BDC3CD',
    hoverClass: 'bg-neutral-bg-hover border-neutral-border-hover text-neutral-text-hover',
  },
  {
    variant: 'secondary-error',
    label: 'Secondary Error (Outline)',
    defaultColors: 'bg white · text #DA2110 · border #DA2110',
    hoverColors: 'bg #FBE8E7 · text #AE1A0C · border #AE1A0C',
    hoverClass: 'bg-error-subtle border-error-hover text-error-text-hover',
  },
  {
    variant: 'tertiary-brand',
    label: 'Tertiary Brand (Ghost)',
    defaultColors: 'bg transparent · text #008C36',
    hoverColors: 'bg #E5F7EC · text #006928',
    hoverClass: 'bg-primary-subtle text-primary-text-hover',
  },
  {
    variant: 'tertiary-neutral',
    label: 'Tertiary Neutral (Ghost)',
    defaultColors: 'bg transparent · text #242A34',
    hoverColors: 'bg #F7F8F9 · text #12151A',
    hoverClass: 'bg-neutral-bg-hover text-neutral-text-strong',
  },
  {
    variant: 'tertiary-error',
    label: 'Tertiary Error (Ghost)',
    defaultColors: 'bg transparent · text #DA2110',
    hoverColors: 'bg #FBE8E7 · text #AE1A0C',
    hoverClass: 'bg-error-subtle text-error-text-hover',
  },
  {
    variant: 'link-brand',
    label: 'Link Brand',
    defaultColors: 'text #008C36',
    hoverColors: 'text #006928 + underline',
    hoverClass: 'text-primary-text-hover underline',
  },
  {
    variant: 'link-neutral',
    label: 'Link Neutral',
    defaultColors: 'text #242A34',
    hoverColors: 'text #12151A + underline',
    hoverClass: 'text-neutral-text-strong underline',
  },
  {
    variant: 'link-error',
    label: 'Link Error',
    defaultColors: 'text #DA2110',
    hoverColors: 'text #AE1A0C + underline',
    hoverClass: 'text-error-text-hover underline',
  },
];

export const HoverColors: Story = {
  name: 'Hover Colors (Figma verified)',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 min-w-[780px]">
      <h2 className="text-xl font-bold text-[#12151A] mb-1">Hover Colors</h2>
      <p className="text-sm text-[#7C889C] mb-8">
        Verified against Figma AKDS-M-Light tokens. "Hover" column simulates hover state via forced className.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[220px_140px_140px] gap-x-6 mb-3 pb-3 border-b border-[#DEE1E6]">
        <span className="text-[11px] font-semibold text-[#9DA6B5] uppercase tracking-widest">Variant</span>
        <span className="text-[11px] font-semibold text-[#9DA6B5] uppercase tracking-widest">Default</span>
        <span className="text-[11px] font-semibold text-[#9DA6B5] uppercase tracking-widest">Hover (simulated)</span>
      </div>

      <div className="space-y-5">
        {HOVER_VARIANTS.map(({ variant, label, defaultColors, hoverColors, hoverClass }) => (
          <div key={variant} className="grid grid-cols-[220px_140px_140px] gap-x-6 items-center">
            {/* Label */}
            <div>
              <div className="text-[13px] font-semibold text-[#37404F]">{label}</div>
              <div className="text-[11px] font-mono text-[#9DA6B5] mt-0.5">{variant}</div>
            </div>

            {/* Default */}
            <div>
              <Button variant={variant}>Label</Button>
              <div className="text-[10px] font-mono text-[#BDC3CD] mt-1.5 leading-relaxed">
                {defaultColors}
              </div>
            </div>

            {/* Hover (forced) */}
            <div>
              <Button variant={variant} className={hoverClass}>Label</Button>
              <div className="text-[10px] font-mono text-[#BDC3CD] mt-1.5 leading-relaxed">
                {hoverColors}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  name: 'Sizes',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-6">
      <h2 className="text-xl font-bold text-[#12151A]">Sizes</h2>
      {(
        [
          { size: 'lg', label: 'lg — 48px · font 18px' },
          { size: 'md', label: 'md — 40px · font 16px (default)' },
          { size: 'sm', label: 'sm — 32px · font 14px' },
        ] as const
      ).map(({ size, label }) => (
        <div key={size} className="space-y-2">
          <p className="text-[11px] font-mono text-[#9DA6B5]">{label}</p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary-brand"    size={size}>Primary</Button>
            <Button variant="secondary-brand"  size={size}>Secondary</Button>
            <Button variant="tertiary-brand"   size={size}>Tertiary</Button>
            <Button variant="secondary-neutral" size={size}>Neutral</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── With Icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: 'Icons',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-8">
      <h2 className="text-xl font-bold text-[#12151A]">Icons</h2>

      <section className="space-y-2">
        <p className="text-[11px] font-mono text-[#9DA6B5]">startIcon / endIcon</p>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary-brand"   startIcon={<Icon />}>Icon Left</Button>
          <Button variant="primary-brand"   endIcon={<Icon />}>Icon Right</Button>
          <Button variant="secondary-brand" startIcon={<Icon />}>Icon Left</Button>
          <Button variant="tertiary-brand"  startIcon={<Icon />}>Icon Left</Button>
          <Button variant="secondary-neutral" startIcon={<Icon />}>Icon Left</Button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[11px] font-mono text-[#9DA6B5]">iconOnly — square button</p>
        <div className="space-y-3">
          {(['lg', 'md', 'sm'] as const).map((size) => (
            <div key={size} className="flex gap-3 items-center">
              <span className="text-[10px] font-mono text-[#BDC3CD] w-4">{size}</span>
              <Button variant="primary-brand"    size={size} iconOnly startIcon={<Icon />} />
              <Button variant="secondary-brand"  size={size} iconOnly startIcon={<Icon />} />
              <Button variant="tertiary-brand"   size={size} iconOnly startIcon={<Icon />} />
              <Button variant="secondary-neutral" size={size} iconOnly startIcon={<Icon />} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[11px] font-mono text-[#9DA6B5]">loading — spinner replaces startIcon</p>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary-brand"   loading>Saving…</Button>
          <Button variant="secondary-brand" loading>Uploading…</Button>
          <Button variant="primary-brand"   loading iconOnly startIcon={<Icon />} />
        </div>
      </section>
    </div>
  ),
};

// ─── States (all variants) ────────────────────────────────────────────────────

export const States: Story = {
  name: 'States',
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => {
    const rows: Array<{ variant: ButtonProps['variant']; label: string }> = [
      { variant: 'primary-brand',    label: 'primary-brand' },
      { variant: 'primary-error',    label: 'primary-error' },
      { variant: 'secondary-brand',  label: 'secondary-brand' },
      { variant: 'secondary-neutral',label: 'secondary-neutral' },
      { variant: 'secondary-error',  label: 'secondary-error' },
      { variant: 'tertiary-brand',   label: 'tertiary-brand' },
      { variant: 'tertiary-neutral', label: 'tertiary-neutral' },
      { variant: 'tertiary-error',   label: 'tertiary-error' },
      { variant: 'link-brand',       label: 'link-brand' },
      { variant: 'link-neutral',     label: 'link-neutral' },
      { variant: 'link-error',       label: 'link-error' },
    ];
    return (
      <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 min-w-[640px]">
        <h2 className="text-xl font-bold text-[#12151A] mb-6">States</h2>

        {/* Column headers */}
        <div className="grid grid-cols-[180px_repeat(3,120px)] gap-x-4 mb-3 pb-3 border-b border-[#DEE1E6]">
          {['Variant', 'Default', 'Disabled', 'Loading'].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-[#9DA6B5] uppercase tracking-widest">{h}</span>
          ))}
        </div>

        <div className="space-y-4">
          {rows.map(({ variant, label }) => (
            <div key={variant} className="grid grid-cols-[180px_repeat(3,120px)] gap-x-4 items-center">
              <span className="text-[12px] font-mono text-[#495569]">{label}</span>
              <Button variant={variant}>Label</Button>
              <Button variant={variant} disabled>Label</Button>
              <Button variant={variant} loading>Label</Button>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ─── Full Width ───────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: 'Full Width',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-3 max-w-md">
      <Button variant="primary-brand"    fullWidth>Primary Full Width</Button>
      <Button variant="secondary-brand"  fullWidth>Secondary Full Width</Button>
      <Button variant="tertiary-neutral" fullWidth>Tertiary Full Width</Button>
    </div>
  ),
};

// ─── Usage in Context ─────────────────────────────────────────────────────────

export const UsageExample: Story = {
  name: 'Usage in Context',
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 max-w-sm space-y-6">
      {/* Danger dialog */}
      <div className="p-6 rounded-xl border border-[#DEE1E6] shadow-md space-y-4 bg-white">
        <h3 className="text-lg font-bold text-[#12151A]">ยืนยันการลบ</h3>
        <p className="text-sm text-[#37404F]">
          คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary-neutral">ยกเลิก</Button>
          <Button variant="primary-error">ลบ</Button>
        </div>
      </div>

      {/* Save dialog */}
      <div className="p-6 rounded-xl border border-[#DEE1E6] shadow-md space-y-4 bg-white">
        <h3 className="text-lg font-bold text-[#12151A]">บันทึกข้อมูล</h3>
        <p className="text-sm text-[#37404F]">ข้อมูลของคุณพร้อมบันทึกแล้ว</p>
        <div className="flex gap-3 justify-end">
          <Button variant="tertiary-brand">ดูตัวอย่าง</Button>
          <Button variant="primary-brand" startIcon={<i className="ri-save-line text-[18px]" />}>
            บันทึก
          </Button>
        </div>
      </div>

      {/* Form actions */}
      <div className="p-6 rounded-xl border border-[#DEE1E6] shadow-md space-y-4 bg-white">
        <h3 className="text-lg font-bold text-[#12151A]">อัปโหลดไฟล์</h3>
        <p className="text-sm text-[#37404F]">เลือกไฟล์ที่ต้องการอัปโหลด</p>
        <div className="flex gap-3">
          <Button variant="secondary-brand" startIcon={<i className="ri-upload-line text-[18px]" />} fullWidth>
            เลือกไฟล์
          </Button>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="tertiary-neutral">ยกเลิก</Button>
          <Button variant="primary-brand" loading>กำลังอัปโหลด…</Button>
        </div>
      </div>
    </div>
  ),
};
