import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardTable, CardTableItem } from '@/design-system';
import type { CardTableProps, CardTableItemData } from '@/design-system';
import { Button } from '@/design-system';

// ─── Sample icon ──────────────────────────────────────────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="10" cy="10" r="8.333" />
    <path d="M10 10v3.333" />
    <circle cx="10" cy="6.667" r="0.833" fill="currentColor" stroke="none" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
  </svg>
);

// ─── Sample actions ───────────────────────────────────────────────────────────

const PrimaryAction = () => (
  <Button variant="secondary-neutral" size="md">Primary</Button>
);

const DualActions = () => (
  <>
    <Button variant="tertiary-neutral" size="md">Secondary</Button>
    <Button variant="secondary-neutral" size="md">Primary</Button>
  </>
);

const SmPrimaryAction = () => (
  <Button variant="secondary-neutral" size="sm">Primary</Button>
);

// ─── Sample data ──────────────────────────────────────────────────────────────

const ITEMS_DESKTOP: CardTableItemData[] = [
  {
    value: 'item-1',
    icon: <InfoIcon />,
    heading: 'Heading text',
    supportingText: 'Supporting text',
    badge: 'Label',
    current: true,
    actions: <DualActions />,
  },
  {
    value: 'item-2',
    icon: <InfoIcon />,
    heading: 'Heading text',
    supportingText: 'Supporting text',
    actions: <PrimaryAction />,
  },
  {
    value: 'item-3',
    icon: <InfoIcon />,
    heading: 'Heading text',
    supportingText: 'Supporting text',
    actions: <PrimaryAction />,
  },
  {
    value: 'item-4',
    icon: <InfoIcon />,
    heading: 'Heading text',
    supportingText: 'Supporting text',
    actions: <PrimaryAction />,
  },
];

const ITEMS_MOBILE: CardTableItemData[] = ITEMS_DESKTOP.map((item) => ({
  ...item,
  actions: item.current ? (
    <>
      <Button variant="tertiary-neutral" size="sm">Secondary</Button>
      <Button variant="secondary-neutral" size="sm">Primary</Button>
    </>
  ) : (
    <SmPrimaryAction />
  ),
}));

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Components/CardTable',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**CardTable** — Allkons Design System

Sources:
- [Figma: Card table item](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002665-10617)
- [Figma: Card table](https://www.figma.com/design/nvIkFt5uZvU9R7uGJginT2/Allkons-DS1?node-id=40002665-11411)

\`\`\`tsx
<CardTable
  items={[
    {
      value: 'item-1',
      icon: <InfoIcon />,
      heading: 'Heading text',
      supportingText: 'Supporting text',
      badge: 'Label',
      current: true,
      actions: <><Button variant="tertiary-neutral">Secondary</Button><Button variant="secondary-neutral">Primary</Button></>,
    },
    { value: 'item-2', icon: <InfoIcon />, heading: 'Heading text', supportingText: 'Supporting text', actions: <Button variant="secondary-neutral">Primary</Button> },
  ]}
  onItemClick={(value) => console.log(value)}
/>
\`\`\`
        `.trim(),
      },
    },
  },
};

export default meta;

// ─── Item sizes ───────────────────────────────────────────────────────────────

export const ItemSizes: StoryObj = {
  name: 'Item — All Sizes',
  render: () => (
    <div className="flex flex-col gap-8 max-w-xl">

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Large</p>
        <CardTableItem size="lg" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" badge="Label" actions={<DualActions />} />
        <CardTableItem size="lg" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" current actions={<DualActions />} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Medium</p>
        <CardTableItem size="md" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" badge="Label" actions={<DualActions />} />
        <CardTableItem size="md" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" current actions={<DualActions />} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Small</p>
        <CardTableItem size="sm" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" badge="Label" actions={<SmPrimaryAction />} />
        <CardTableItem size="sm" icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" current actions={<SmPrimaryAction />} />
      </div>

    </div>
  ),
};

// ─── Item states ──────────────────────────────────────────────────────────────

export const ItemStates: StoryObj = {
  name: 'Item — States',
  render: () => (
    <div className="flex flex-col gap-3 max-w-xl">
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Default</p>
      <CardTableItem icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Current</p>
      <CardTableItem icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" badge="Label" current actions={<DualActions />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">Disabled</p>
      <CardTableItem icon={<InfoIcon />} heading="Heading text" supportingText="Supporting text" disabled actions={<PrimaryAction />} />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No icon / No actions</p>
      <CardTableItem heading="Heading text" supportingText="Supporting text" />
      <p className="text-xs font-medium text-text-quaternary uppercase tracking-wide">No supporting text</p>
      <CardTableItem icon={<StarIcon />} heading="Heading text" badge="New" actions={<PrimaryAction />} />
    </div>
  ),
};

// ─── Vertical (Desktop) — interactive ────────────────────────────────────────

export const VerticalDesktop: StoryObj = {
  name: 'Vertical — Desktop',
  render: () => {
    const [current, setCurrent] = useState('item-1');
    const items = ITEMS_DESKTOP.map((item) => ({
      ...item,
      current: item.value === current,
      actions: item.value === current ? <DualActions /> : <PrimaryAction />,
    }));
    return (
      <div className="max-w-xl">
        <CardTable
          items={items}
          layout="vertical"
          breakpoint="desktop"
          onItemClick={setCurrent}
        />
      </div>
    );
  },
};

// ─── Vertical (Mobile) — interactive ─────────────────────────────────────────

export const VerticalMobile: StoryObj = {
  name: 'Vertical — Mobile',
  render: () => {
    const [current, setCurrent] = useState('item-1');
    const items = ITEMS_MOBILE.map((item) => ({
      ...item,
      current: item.value === current,
      actions: item.value === current ? (
        <>
          <Button variant="tertiary-neutral" size="sm">Secondary</Button>
          <Button variant="secondary-neutral" size="sm">Primary</Button>
        </>
      ) : (
        <SmPrimaryAction />
      ),
    }));
    return (
      <div className="w-[343px]">
        <CardTable
          items={items}
          layout="vertical"
          breakpoint="mobile"
          onItemClick={setCurrent}
        />
      </div>
    );
  },
};

// ─── Horizontal (Desktop) — interactive ──────────────────────────────────────

export const HorizontalDesktop: StoryObj = {
  name: 'Horizontal — Desktop',
  render: () => {
    const [current, setCurrent] = useState('item-1');
    const items = ITEMS_DESKTOP.slice(0, 2).map((item) => ({
      ...item,
      current: item.value === current,
      actions: item.value === current ? <DualActions /> : <PrimaryAction />,
    }));
    return (
      <CardTable
        items={items}
        layout="horizontal"
        breakpoint="desktop"
        onItemClick={setCurrent}
      />
    );
  },
};

// ─── Horizontal (Mobile) — interactive ───────────────────────────────────────

export const HorizontalMobile: StoryObj = {
  name: 'Horizontal — Mobile',
  render: () => {
    const [current, setCurrent] = useState('item-1');
    const items = ITEMS_MOBILE.slice(0, 2).map((item) => ({
      ...item,
      current: item.value === current,
      actions: item.value === current ? (
        <>
          <Button variant="tertiary-neutral" size="sm">Secondary</Button>
          <Button variant="secondary-neutral" size="sm">Primary</Button>
        </>
      ) : (
        <SmPrimaryAction />
      ),
    }));
    return (
      <div className="w-[343px]">
        <CardTable
          items={items}
          layout="horizontal"
          breakpoint="mobile"
          onItemClick={setCurrent}
        />
      </div>
    );
  },
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: StoryObj<CardTableProps> = {
  name: 'Playground',
  args: {
    layout:     'vertical',
    breakpoint: 'desktop',
  },
  argTypes: {
    layout:     { control: 'radio', options: ['vertical', 'horizontal'] },
    breakpoint: { control: 'radio', options: ['desktop', 'mobile'] },
    size:       { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => {
    const [current, setCurrent] = useState('item-1');
    const items = ITEMS_DESKTOP.map((item) => ({
      ...item,
      current: item.value === current,
      actions: item.value === current ? <DualActions /> : <PrimaryAction />,
    }));
    return (
      <div className="max-w-xl">
        <CardTable
          {...args}
          items={items}
          onItemClick={(v) => { setCurrent(v); }}
        />
      </div>
    );
  },
};
