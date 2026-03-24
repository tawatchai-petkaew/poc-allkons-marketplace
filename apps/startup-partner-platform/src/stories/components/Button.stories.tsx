import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
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

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {};

// ─── All Variants ─────────────────────────────────────────────────────────────

const Icon = () => (
  <i className="ri-add-line text-[18px] leading-none" />
);

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-8 min-w-[640px]">
      <h2 className="text-h5 font-bold text-text-primary">Button Variants</h2>

      {/* Primary */}
      <section className="space-y-3">
        <h3 className="text-xs text-text-quaternary uppercase tracking-widest font-semibold">Primary — Filled</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary-brand">Brand</Button>
          <Button variant="primary-error">Error</Button>
          <Button variant="primary-brand" disabled>Disabled</Button>
          <Button variant="primary-brand" loading>Loading</Button>
        </div>
      </section>

      {/* Secondary */}
      <section className="space-y-3">
        <h3 className="text-xs text-text-quaternary uppercase tracking-widest font-semibold">Secondary — Outline</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary-brand">Brand</Button>
          <Button variant="secondary-neutral">Neutral</Button>
          <Button variant="secondary-error">Error</Button>
          <Button variant="secondary-neutral" disabled>Disabled</Button>
        </div>
      </section>

      {/* Tertiary */}
      <section className="space-y-3">
        <h3 className="text-xs text-text-quaternary uppercase tracking-widest font-semibold">Tertiary — Ghost</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="tertiary-brand">Brand</Button>
          <Button variant="tertiary-neutral">Neutral</Button>
          <Button variant="tertiary-error">Error</Button>
          <Button variant="tertiary-brand" disabled>Disabled</Button>
        </div>
      </section>

      {/* Link */}
      <section className="space-y-3">
        <h3 className="text-xs text-text-quaternary uppercase tracking-widest font-semibold">Link</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="link-brand">Brand</Button>
          <Button variant="link-neutral">Neutral</Button>
          <Button variant="link-error">Error</Button>
          <Button variant="link-brand" disabled>Disabled</Button>
        </div>
      </section>
    </div>
  ),
};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-6">
      <h2 className="text-h5 font-bold text-text-primary">Sizes</h2>
      {(
        [
          { size: 'lg', label: 'Large — 48px' },
          { size: 'md', label: 'Medium — 40px (default)' },
          { size: 'sm', label: 'Small — 32px' },
        ] as const
      ).map(({ size, label }) => (
        <div key={size} className="space-y-2">
          <p className="text-xs text-text-quaternary font-mono">{label}</p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary-brand"   size={size}>Primary</Button>
            <Button variant="secondary-brand" size={size}>Secondary</Button>
            <Button variant="tertiary-brand"  size={size}>Tertiary</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── With Icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-6">
      <h2 className="text-h5 font-bold text-text-primary">Icons</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary-brand" startIcon={<Icon />}>Icon Start</Button>
          <Button variant="primary-brand" endIcon={<Icon />}>Icon End</Button>
          <Button variant="secondary-brand" startIcon={<Icon />}>Icon Start</Button>
          <Button variant="tertiary-brand" startIcon={<Icon />}>Icon Start</Button>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-text-quaternary font-mono">Icon Only</p>
          <div className="flex gap-3 items-center">
            <Button variant="primary-brand"   size="lg" iconOnly startIcon={<Icon />} />
            <Button variant="primary-brand"   size="md" iconOnly startIcon={<Icon />} />
            <Button variant="primary-brand"   size="sm" iconOnly startIcon={<Icon />} />
            <Button variant="secondary-brand" size="md" iconOnly startIcon={<Icon />} />
            <Button variant="tertiary-brand"  size="md" iconOnly startIcon={<Icon />} />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ─── Full Width ───────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-3 max-w-md">
      <Button variant="primary-brand"   fullWidth>Primary Full Width</Button>
      <Button variant="secondary-brand" fullWidth>Secondary Full Width</Button>
      <Button variant="tertiary-neutral" fullWidth>Tertiary Full Width</Button>
    </div>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 space-y-6">
      <h2 className="text-h5 font-bold text-text-primary">States</h2>
      {(['primary-brand', 'secondary-brand', 'tertiary-brand'] as const).map((v) => (
        <div key={v} className="space-y-2">
          <p className="text-xs text-text-quaternary font-mono">{v}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant={v}>Default</Button>
            <Button variant={v} disabled>Disabled</Button>
            <Button variant={v} loading>Loading</Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Usage in Context ─────────────────────────────────────────────────────────

export const UsageExample: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="font-['Noto_Sans_Thai_Looped',sans-serif] p-8 max-w-sm space-y-6">
      <div className="p-6 rounded-xl border border-border-primary shadow-md space-y-4">
        <h3 className="text-h4 font-bold text-text-primary">ยืนยันการลบ</h3>
        <p className="text-middle-regular text-text-secondary">
          คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary-neutral">ยกเลิก</Button>
          <Button variant="primary-error">ลบ</Button>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border-primary shadow-md space-y-4">
        <h3 className="text-h4 font-bold text-text-primary">บันทึกข้อมูล</h3>
        <p className="text-middle-regular text-text-secondary">
          ข้อมูลของคุณพร้อมบันทึกแล้ว
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="tertiary-brand">ดูตัวอย่าง</Button>
          <Button variant="primary-brand" startIcon={<i className="ri-save-line" />}>บันทึก</Button>
        </div>
      </div>
    </div>
  ),
};
